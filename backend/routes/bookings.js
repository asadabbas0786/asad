import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

/**
 * POST /api/bookings
 * Body: {
 *   slotId: number,
 *   name: string,
 *   email?: string,
 *   mobile_no?: string,
 *   seats: number[],             // seat ids to book
 *   amount_paid: number,
 *   payment_ref?: string
//  * }
//  * Creates booking + booking_seats. If any seat already booked for that slot, 409.
//  */
// router.post("/", async (req, res) => {
//   const { slotId, name, email, mobile_no, seats = [], amount_paid, payment_ref } = req.body || {};

//   if (!slotId || !name || !Array.isArray(seats) || seats.length < 1) {
//     return res.status(400).json({ error: "slotId, name and seats[] are required" });
//   }

//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();

//     // Find slot & center
//     const [[slot]] = await conn.query(
//       `SELECT id, center_id FROM slots WHERE id = ?`,
//       [slotId]
//     );
//     if (!slot) {
//       await conn.rollback();
//       return res.status(404).json({ error: "Slot not found" });
//     }

//     // Validate seats belong to the same center
//     const placeholders = seats.map(() => "?").join(",");
//     const [owned] = await conn.query(
//       `
//       SELECT id FROM seats
//       WHERE center_id = ? AND id IN (${placeholders})
//       `,
//       [slot.center_id, ...seats]
//     );
//     if (owned.length !== seats.length) {
//       await conn.rollback();
//       return res.status(400).json({ error: "One or more seats do not belong to this slot's center" });
//     }

//     // Insert booking
//     const [ins] = await conn.query(
//       `
//       INSERT INTO bookings (slot_id, name, email, mobile_no, amount_paid, currency, status, payment_ref)
//       VALUES (?, ?, ?, ?, ?, 'INR', 'CONFIRMED', ?)
//       `,
//       [slotId, name, email || null, mobile_no || null, amount_paid ?? 0, payment_ref || null]
//     );
//     const bookingId = ins.insertId;

//     // Insert booking seats; rely on UNIQUE(slot_id, seat_id) to prevent double-book
//     const values = seats.map(seatId => [bookingId, slotId, seatId, null]);
//     try {
//       await conn.query(
//         `INSERT INTO booking_seats (booking_id, slot_id, seat_id, seat_price) VALUES ?`,
//         [values]
//       );
//     } catch (e) {
//       // duplicate means some seat already booked for this slot
//       await conn.rollback();
//       return res.status(409).json({ error: "One or more seats already booked for this slot" });
//     }

//     await conn.commit();
//     res.status(201).json({ bookingId, amount: amount_paid ?? 0 });
//   } catch (err) {
//     await conn.rollback();
//     res.status(500).json({ error: "BOOKING_CREATE_FAILED" });
//   } finally {
//     conn.release();
//   }
// });

router.post("/", async (req, res) => {
  const { slotId, name, email, mobile_no, amount_paid, payment_ref } = req.body || {};

  // Normalize seat(s): allow seatId OR seats:[]
  let seats = [];
  if (Array.isArray(req.body?.seats)) seats = req.body.seats;
  else if (req.body?.seatId != null) seats = [req.body.seatId];

  if (!slotId || !name || seats.length !== 1) {
    return res.status(400).json({ error: "slotId, name and exactly one seat id (seatId or seats[0]) are required" });
  }

  const seatId = Number(seats[0]);
  if (!Number.isFinite(seatId) || seatId <= 0) {
    return res.status(400).json({ error: "Invalid seat id" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Slot & center
    const [[slot]] = await conn.query(
      `SELECT id, center_id, price, status FROM slots WHERE id = ? LIMIT 1`,
      [slotId]
    );
    if (!slot) {
      await conn.rollback();
      return res.status(404).json({ error: "Slot not found" });
    }
    if (slot.status !== "SCHEDULED") {
      await conn.rollback();
      return res.status(400).json({ error: "Slot is not available" });
    }

    // 2) Ensure this is one of the 6 mini-slot seats for that center
    // (idempotently create if missing)
    await conn.query(
      `
      INSERT INTO seats (center_id, row_label, col_number, seat_type, base_price, is_active)
      SELECT ?, 'MS', n.col, 'REGULAR', 0, 1
      FROM (SELECT 1 col UNION ALL SELECT 2 UNION ALL SELECT 3
            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) n
      LEFT JOIN seats s
        ON s.center_id = ? AND s.row_label = 'MS' AND s.col_number = n.col
      WHERE s.id IS NULL
      `,
      [slot.center_id, slot.center_id]
    );

    const [[validSeat]] = await conn.query(
      `
      SELECT id, col_number
      FROM seats
      WHERE id = ? AND center_id = ? AND row_label = 'MS' AND col_number BETWEEN 1 AND 6
      LIMIT 1
      `,
      [seatId, slot.center_id]
    );
    if (!validSeat) {
      await conn.rollback();
      return res.status(400).json({ error: "Seat does not belong to this slot's center or is not a mini-slot seat" });
    }

    // 3) Create booking
    const effectiveAmount = (amount_paid == null ? slot.price : amount_paid);
    const [ins] = await conn.query(
      `
      INSERT INTO bookings (slot_id, name, email, mobile_no, amount_paid, currency, status, payment_ref)
      VALUES (?, ?, ?, ?, ?, 'INR', 'CONFIRMED', ?)
      `,
      [slotId, name, email || null, mobile_no || null, effectiveAmount, payment_ref || null]
    );
    const bookingId = ins.insertId;

    // 4) Link single seat (UNIQUE(slot_id, seat_id) avoids double booking)
    try {
      await conn.query(
        `INSERT INTO booking_seats (booking_id, slot_id, seat_id, seat_price) VALUES (?, ?, ?, ?)`,
        [bookingId, slotId, seatId, effectiveAmount]
      );
    } catch (e) {
      await conn.rollback();
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Seat already booked for this slot" });
      }
      return res.status(500).json({ error: "BOOKING_SEAT_LINK_FAILED" });
    }

    await conn.commit();
    res.status(201).json({ bookingId, amount: effectiveAmount });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: "BOOKING_CREATE_FAILED" });
  } finally {
    conn.release();
  }
});




/** GET /api/bookings/:id -> booking + seats */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [[b]] = await pool.query(`SELECT * FROM bookings WHERE id = ?`, [id]);
    if (!b) return res.status(404).json({ error: "Not found" });

    const [items] = await pool.query(
      `
      SELECT
        bs.seat_id,
        s.row_label AS rowLabel,
        s.col_number AS colNumber,
        bs.seat_price
      FROM booking_seats bs
      JOIN seats s ON s.id = bs.seat_id
      WHERE bs.booking_id = ?
      ORDER BY s.row_label, s.col_number
      `,
      [id]
    );

    res.json({ ...b, seats: items });
  } catch (err) {
    res.status(500).json({ error: "BOOKING_FETCH_FAILED" });
  }
});

export default router;
