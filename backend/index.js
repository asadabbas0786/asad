import express from "express";
import cors from "cors";
import morgan from "morgan";
import slots from "./routes/slots.js";
import bookings from "./routes/bookings.js";

const app = express();

// CORS + JSON
app.use(cors());
app.use(express.json());

// Access logs
app.use(morgan("dev"));

// Disable HTTP caching
app.set("etag", false);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

app.use("/api/slots", slots);
app.use("/api/bookings", bookings);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(4000, () => console.log("API running on http://localhost:4000"));
