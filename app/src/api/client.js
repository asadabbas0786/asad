const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:4000";
export const API = `${API_BASE}/api`;



// const API = "http://127.0.0.1:4000/api";

// helper: cache buster
const bust = () => `_=${Date.now()}`;

/** SLOTS (per centerId + date) */
export async function getSlots(centerId, date, { signal } = {}) {
  const url = `${API}/slots/${encodeURIComponent(centerId)}/${encodeURIComponent(date)}?${bust()}`;
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch slots for ${centerId}@${date}`);
  return res.json();
}

/** SEATS (per slotId) */
// api/client.js
export async function getSeats(slotId, { signal } = {}) {
  const url = `${API}/slots/seats/${encodeURIComponent(slotId)}?${bust()}`;
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch seats");
  return res.json();
}


/** Resolve slotId from (centerId,date,start,end?) – keeps your fallback working */
export async function resolveSlotId(centerId, date, start, end) {
  const qs = new URLSearchParams({ centerId, date, start });
  if (end) qs.set("end", end);
  const res = await fetch(`${API}/slots/resolve?${qs.toString()}&${bust()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("No matching slot");
  const data = await res.json();
  return data.slotId;
}

/** SIMPLE BOOKING (no hold) */
export async function createBookingSimple(payload) {
  const res = await fetch(`${API}/bookings?${bust()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to create booking");
  return data;
}
