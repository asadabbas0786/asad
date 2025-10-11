import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const { slotId, name, email, mobile_no, amount_paid, payment_ref } = req.body || {};

  // Normalize seat(s) - expect single seat per request
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

  const mobile = (mobile_no || "").toString().trim() || null;
  const mail = (email || "").toString().trim() || null;

  // Require at least one unique identifier: mobile_no or email
  if (!mobile && !mail) {
    return res.status(400).json({ error: "mobile_no or email is required and must be unique" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Fetch slot (and center info + session_date)
    const [[slot]] = await conn.query(
      `SELECT id, center_id, price, status, session_date FROM slots WHERE id = ? LIMIT 1`,
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

    // 2) ENFORCE daily booking limit: count seats already booked by this mobile_no or email on same session_date
    const identityParts = [];
    const identityParams = [slot.session_date]; // first param is session_date

    if (mobile) {
      identityParts.push("b.mobile_no = ?");
      identityParams.push(mobile);
    }
    if (mail) {
      identityParts.push("b.email = ?");
      identityParams.push(mail);
    }
    const identityClause = "(" + identityParts.join(" OR ") + ")";

    const countQuery = `
      SELECT COUNT(bs.id) AS cnt
      FROM bookings b
      JOIN booking_seats bs ON bs.booking_id = b.id
      JOIN slots s ON b.slot_id = s.id
      WHERE s.session_date = ? AND ${identityClause} AND (b.status IS NULL OR b.status <> 'CANCELLED')
    `;
    const [[countRow]] = await conn.query(countQuery, identityParams);
    const alreadyBookedSeats = Number(countRow?.cnt ?? 0);

    if (alreadyBookedSeats >= 3) {
      await conn.rollback();
      return res.status(403).json({
        error: "DAILY_LIMIT_REACHED",
        message: `You already have ${alreadyBookedSeats} booked seat(s) on ${slot.session_date}. Maximum 3 seats per person per day allowed.`
      });
    }

    // 3) Ensure mini-slot seats exist (idempotent create)
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

    // 4) Validate seat belongs to this center and is MS 1..6
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

    // 5) Create booking
    const effectiveAmount = (amount_paid == null ? slot.price : Number(amount_paid));
    const [ins] = await conn.query(
      `
      INSERT INTO bookings (slot_id, name, email, mobile_no, amount_paid, currency, status, payment_ref)
      VALUES (?, ?, ?, ?, ?, 'INR', 'CONFIRMED', ?)
      `,
      [slotId, name, mail || null, mobile || null, effectiveAmount, payment_ref || null]
    );
    const bookingId = ins.insertId;

    // 6) Link single seat (UNIQUE(slot_id, seat_id) avoids double booking)
    try {
      await conn.query(
        `INSERT INTO booking_seats (booking_id, slot_id, seat_id, seat_price) VALUES (?, ?, ?, ?)`,
        [bookingId, slotId, seatId, effectiveAmount]
      );
    } catch (e) {
      await conn.rollback();
      if (e && e.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Seat already booked for this slot" });
      }
      console.error("booking_seat insert failed:", e);
      return res.status(500).json({ error: "BOOKING_SEAT_LINK_FAILED" });
    }

    await conn.commit();
    return res.status(201).json({ bookingId, amount: effectiveAmount });
  } catch (err) {
    try { await conn.rollback(); } catch (er) { /* noop */ }
    console.error("BOOKING_CREATE_FAILED:", err);
    return res.status(500).json({ error: "BOOKING_CREATE_FAILED" });
  } finally {
    conn.release();
  }
});

export default router;
