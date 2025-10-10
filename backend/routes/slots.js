import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

/** Validate/normalize center code */
function normalizeCenterCode(raw) {
  const s = String(raw || "").toLowerCase();
  if (/^c\d+$/.test(s)) return s;       // c1, c2, c3...
  if (/^\d+$/.test(s)) return `c${s}`;   // 1 -> c1
  throw new Error("INVALID_CENTER_CODE");
}

/** Quick YYYY-MM-DD check */
function isISODate(x) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(x || ""));
}

/**
 * ---------- ORDER MATTERS ----------
 * Put specific routes BEFORE the generic /:centerCode/:date
 */

/**
 * GET /api/slots/seats/:slotId
 * Seat grid for slot's center; marks BOOKED/AVAILABLE using booking_seats.
 */
// router.get("/seats/:slotId", async (req, res) => {
//   const { slotId } = req.params;

//   try {
//     const [[slot]] = await pool.query(
//       `SELECT id, center_id, price FROM slots WHERE id = ?`,
//       [slotId]
//     );
//     if (!slot) return res.status(404).json({ error: "Slot not found" });

//     const [rows] = await pool.query(
//       `
//       SELECT
//         s.id,
//         s.row_label  AS \`row\`,
//         s.col_number AS \`col\`,
//         s.seat_type  AS \`type\`,
//         (s.base_price + ?) AS price,
//         CASE
//           WHEN EXISTS (
//             SELECT 1 FROM booking_seats bs
//             WHERE bs.slot_id = ? AND bs.seat_id = s.id
//           ) THEN 'BOOKED'
//           ELSE 'AVAILABLE'
//         END AS status
//       FROM seats s
//       WHERE s.center_id = ?
//       ORDER BY s.row_label, s.col_number
//       `,
//       [slot.price || 0, slot.id, slot.center_id]
//     );

//     res.json({ seats: rows });
//   } catch (err) {
//     console.error("SEATS_LIST_FAILED:", err);
//     res.status(500).json({ error: "SEATS_LIST_FAILED" });
//   }
// });

// GET /api/seats/:slotId
// -> { seats: [{id,label,displayNo,price,status}] }
// GET /api/slots/seats/:slotId
// routes/slots.js
router.get("/seats/:slotId", async (req, res) => {
  const slotId = Number(req.params.slotId);
  if (!slotId) return res.status(400).json({ message: "Invalid slotId" });

  const [[slot]] = await pool.query(
    "SELECT id, center_id, price, status FROM slots WHERE id = ? LIMIT 1",
    [slotId]
  );
  if (!slot) return res.status(404).json({ message: "Slot not found" });

  // ensure 6 mini-slot seats exist (idempotent)
  await pool.query(`
    INSERT INTO seats (center_id, row_label, col_number, seat_type, base_price, is_active)
    SELECT ?, 'MS', n.col, 'REGULAR', 0, 1
    FROM (SELECT 1 col UNION ALL SELECT 2 UNION ALL SELECT 3
          UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) n
    LEFT JOIN seats s
      ON s.center_id = ? AND s.row_label = 'MS' AND s.col_number = n.col
    WHERE s.id IS NULL
  `, [slot.center_id, slot.center_id]);

  const [seats] = await pool.query(
    `SELECT id, col_number
       FROM seats
      WHERE center_id = ? AND row_label = 'MS' AND col_number BETWEEN 1 AND 6
      ORDER BY col_number ASC`,
    [slot.center_id]
  );

  const [bookedRows] = await pool.query(
    "SELECT seat_id FROM booking_seats WHERE slot_id = ?",
    [slotId]
  );
  const booked = new Set(bookedRows.map(r => r.seat_id));

  res.json({
    seats: seats.map(s => ({
      id: String(s.id),
      label: `MS-${s.col_number}`,
      displayNo: s.col_number,
      price: slot.price,
      status: booked.has(s.id) ? "BOOKED" : "AVAILABLE"
    }))
  });
});




/**
 * GET /api/slots/resolve?centerId=c1&date=YYYY-MM-DD&start=HH:MM[&end=HH:MM]
 * Returns { slotId } or 404.
 */
router.get("/resolve", async (req, res) => {
  const { centerId, date, start, end } = req.query || {};
  if (!centerId || !date || !start) {
    return res.status(400).json({ error: "centerId, date, start are required" });
  }
  if (!isISODate(date)) return res.status(400).json({ error: "Invalid date" });

  try {
    const code = normalizeCenterCode(centerId);
    const params = [code, date, `${start}:00`.slice(0, 8)];
    let sql = `
      SELECT s.id
      FROM slots s
      JOIN centers c ON c.id = s.center_id
      WHERE c.code = ? AND s.session_date = ? AND s.start_time = ?
    `;
    if (end) {
      sql += ` AND s.end_time = ?`;
      params.push(`${end}:00`.slice(0, 8));
    }
    sql += ` LIMIT 1`;

    const [rows] = await pool.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: "No matching slot" });
    res.json({ slotId: rows[0].id });
  } catch (err) {
    if (err?.message === "INVALID_CENTER_CODE") {
      return res.status(400).json({ error: "Invalid centerId" });
    }
    console.error("SLOT_RESOLVE_FAILED:", err);
    res.status(500).json({ error: "SLOT_RESOLVE_FAILED" });
  }
});

/**
 * GET /api/slots/:centerCode/:date
 * List scheduled slots for a center & date.
 */
router.get("/:centerCode/:date", async (req, res) => {
  try {
    const centerCode = normalizeCenterCode(req.params.centerCode);
    const date = req.params.date;
    if (!isISODate(date)) return res.status(400).json({ error: "Invalid date" });

    const [rows] = await pool.query(
      `
      SELECT
        s.id,
        DATE_FORMAT(s.start_time, '%H:%i') AS start,
        DATE_FORMAT(s.end_time,   '%H:%i') AS end,
        s.price,
        s.status,
        '' AS subtitle
      FROM slots s
      JOIN centers c ON c.id = s.center_id
      WHERE c.code = ? AND s.session_date = ?
      ORDER BY s.start_time ASC
      `,
      [centerCode, date]
    );

    res.json({ slots: rows });
  } catch (err) {
    if (err?.message === "INVALID_CENTER_CODE") {
      return res.status(400).json({ error: "Invalid center" });
    }
    console.error("SLOTS_LIST_FAILED:", err);
    res.status(500).json({ error: "SLOTS_LIST_FAILED" });
  }
});

export default router;
