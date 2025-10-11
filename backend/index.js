import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import slots from "./routes/slots.js";
import bookings from "./routes/bookings.js";

dotenv.config();

const app = express();

/**
 * Configuration from environment
 * - ALLOWED_ORIGINS: comma separated list of allowed origins (exact matches).
 *   e.g. "http://localhost:3000,https://app.example.com"
 * - PORT: server port
 * - TRUST_PROXY: "true" if behind a proxy (Heroku, Cloudflare, etc.)
 * - ALLOW_CREDENTIALS: "true" if you need cookies / credentials from browser
 */
const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
const TRUST_PROXY = process.env.TRUST_PROXY === "true";
const ALLOW_CREDENTIALS = process.env.ALLOW_CREDENTIALS === "true";

/** If behind a proxy (nginx / load balancer), enable trust proxy for secure cookies, rate-limit etc. */
if (TRUST_PROXY) {
  app.set("trust proxy", 1);
}

/** Security middlewares */
app.use(helmet()); // sets various HTTP headers for basic protection

/** Rate limiting to mitigate brute force / DoS */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 200, // max requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/** CORS configuration */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests like curl/postman where origin is undefined
    if (!origin) return callback(null, true);

    // exact match check against ALLOWED_ORIGINS
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // optionally allow subdomains of a domain with regex in env
    // (not enabled by default)
    const allowedRegex = process.env.ALLOWED_ORIGIN_REGEX;
    if (allowedRegex) {
      try {
        const re = new RegExp(allowedRegex);
        if (re.test(origin)) return callback(null, true);
      } catch (err) {
        console.error("Invalid ALLOWED_ORIGIN_REGEX:", err.message);
      }
    }

    callback(new Error("CORS policy: Origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: ALLOW_CREDENTIALS,
  optionsSuccessStatus: 204,
  maxAge: 600, // seconds to cache preflight
};

app.use(cors(corsOptions));

/** Allow express to parse JSON bodies */
app.use(express.json());

/** HTTP access logs */
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/** Disable HTTP caching for API responses (you already had this) */
app.set("etag", false);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

/** Mount your routes */
app.use("/api/slots", slots);
app.use("/api/bookings", bookings);

/** Health check */
app.get("/health", (_req, res) => res.json({ ok: true }));

/** Global error handler — catches CORS and other errors and returns JSON */
app.use((err, req, res, next) => {
  // If headers already sent, delegate to default handler
  if (res.headersSent) return next(err);

  // Handle CORS rejection separately for clearer messages
  if (err && /CORS policy: Origin not allowed/.test(err.message)) {
    return res.status(403).json({ error: "Origin not allowed by CORS policy" });
  }

  console.error(err && err.stack ? err.stack : err);
  res.status(err && err.status ? err.status : 500).json({
    error: err && err.message ? err.message : "Internal Server Error",
  });
});

/** Start server */
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT} (ENV=${process.env.NODE_ENV || "development"})`);
});
