import express from "express";
import cors from "cors";
import { env } from "./lib/env";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { contactsRouter } from "./routes/contacts";
import { propertiesRouter } from "./routes/properties";
import { leadsRouter } from "./routes/leads";
import { tasksRouter } from "./routes/tasks";
import { dashboardRouter } from "./routes/dashboard";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/dashboard", dashboardRouter);

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
