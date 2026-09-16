import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

// FR-5.2: each Agent sees their own upcoming/overdue tasks; Admins see everyone's.
tasksRouter.get("/", async (req, res) => {
  const scope = req.user!.role === "ADMIN" ? {} : { assignedTo: req.user!.id };
  const tasks = await prisma.task.findMany({
    where: scope,
    include: { lead: { include: { contact: true } } },
    orderBy: { dueDate: "asc" },
  });
  res.json(tasks);
});

const taskSchema = z.object({
  leadId: z.string().uuid(),
  title: z.string().min(1),
  dueDate: z.coerce.date(),
  assignedTo: z.string().uuid(),
});

// FR-5.1: create a task linked to a lead, with a due date and assignee.
tasksRouter.post("/", async (req, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const task = await prisma.task.create({ data: parsed.data });
  res.status(201).json(task);
});

// FR-5.3: mark a task as complete.
tasksRouter.patch("/:id/complete", async (req, res) => {
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status: "DONE" },
  });
  res.json(task);
});
