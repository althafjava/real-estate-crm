import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import type { Prisma } from "@prisma/client";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

// FR-6.1 / FR-6.2: lead counts by pipeline stage, plus the current user's upcoming follow-ups.
dashboardRouter.get("/", async (req, res) => {
  const leadScope: Prisma.LeadWhereInput = req.user!.role === "ADMIN" ? {} : { assignedAgentId: req.user!.id };
  const taskScope: Prisma.TaskWhereInput = req.user!.role === "ADMIN" ? {} : { assignedTo: req.user!.id };

  const [stageGroups, upcomingTasks] = await Promise.all([
    prisma.lead.groupBy({ by: ["stage"], where: leadScope, _count: { _all: true } }),
    prisma.task.findMany({
      where: { ...taskScope, status: "PENDING" },
      include: { lead: { include: { contact: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  const leadCountsByStage = Object.fromEntries(stageGroups.map((g) => [g.stage, g._count._all]));

  res.json({ leadCountsByStage, upcomingTasks });
});
