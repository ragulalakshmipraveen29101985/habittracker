import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { trackersRouter } from "./routes/trackers.js";
import { habitsRouter } from "./routes/habits.js";
import { completionsRouter } from "./routes/completions.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, env: env.NODE_ENV, time: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use("/trackers", trackersRouter);
app.use("/habits", habitsRouter);
app.use("/completions", completionsRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error("[error]", err);
  if (err?.name === "ZodError") {
    res.status(400).json({ error: "Validation failed", details: err.issues });
    return;
  }
  const status = typeof err?.status === "number" ? err.status : 500;
  res.status(status).json({ error: err?.message ?? "Internal error" });
};
app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`\n  Streak server listening on http://localhost:${env.PORT}`);
  console.log(`  env=${env.NODE_ENV}\n`);
});
