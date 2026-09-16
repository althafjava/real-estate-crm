import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import type { AuthUser } from "../middleware/auth";
import type { Prisma } from "@prisma/client";

export const leadsRouter = Router();

leadsRouter.use(requireAuth);

const FOLLOW_UP_DAYS = 3;

// FR-1.4: Agents only see their own leads; Admins see everything.
function scopeToUser(user: AuthUser): Prisma.LeadWhereInput {
  return user.role === "ADMIN" ? {} : { assignedAgentId: user.id };
}

function withNeedsFollowUp<T extends { lastActivityAt: Date }>(lead: T) {
  const cutoff = Date.now() - FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000;
  return { ...lead, needsFollowUp: lead.lastActivityAt.getTime() < cutoff };
}

leadsRouter.get("/", async (req, res) => {
  const { stage } = req.query;
  const leads = await prisma.lead.findMany({
    where: {
      ...scopeToUser(req.user!),
      stage: stage ? (String(stage) as any) : undefined,
    },
    include: { contact: true, assignedAgent: true, interestedProperty: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(leads.map(withNeedsFollowUp));
});

const leadSchema = z.object({
  contactId: z.string().uuid(),
  source: z.enum(["NINETYNINE_ACRES", "MAGICBRICKS", "HOUSING_COM", "REFERRAL", "WALK_IN", "OTHER"]),
  assignedAgentId: z.string().uuid().optional().nullable(),
  interestedPropertyId: z.string().uuid().optional().nullable(),
  budget: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// FR-2.1: create a lead with contact, source, interested property/budget, notes.
leadsRouter.post("/", async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const lead = await prisma.lead.create({ data: parsed.data, include: { contact: true } });
  res.status(201).json(lead);
});

async function findScopedLead(id: string, user: AuthUser) {
  return prisma.lead.findFirst({ where: { id, ...scopeToUser(user) } });
}

leadsRouter.get("/:id", async (req, res) => {
  const lead = await prisma.lead.findFirst({
    where: { id: req.params.id, ...scopeToUser(req.user!) },
    include: {
      contact: true,
      assignedAgent: true,
      interestedProperty: true,
      activities: { orderBy: { createdAt: "desc" }, include: { user: true } },
      stageHistory: { orderBy: { createdAt: "desc" }, include: { changedBy: true } },
      tasks: { orderBy: { dueDate: "asc" } },
    },
  });
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json(withNeedsFollowUp(lead));
});

// FR-2.3: assign a lead to an agent, manually by an Admin/Manager.
const updateSchema = z.object({
  assignedAgentId: z.string().uuid().optional().nullable(),
  interestedPropertyId: z.string().uuid().optional().nullable(),
  budget: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
});

leadsRouter.patch("/:id", async (req, res) => {
  const existing = await findScopedLead(req.params.id, req.user!);
  if (!existing) return res.status(404).json({ error: "Lead not found" });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const lead = await prisma.lead.update({ where: { id: existing.id }, data: parsed.data });
  res.json(lead);
});

const stageSchema = z.object({
  stage: z.enum(["NEW", "CONTACTED", "SITE_VISIT", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"]),
});

// FR-2.2 / FR-2.4: move a lead through the pipeline and log the change.
leadsRouter.post("/:id/stage", async (req, res) => {
  const existing = await findScopedLead(req.params.id, req.user!);
  if (!existing) return res.status(404).json({ error: "Lead not found" });

  const parsed = stageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [lead] = await prisma.$transaction([
    prisma.lead.update({
      where: { id: existing.id },
      data: { stage: parsed.data.stage, lastActivityAt: new Date() },
    }),
    prisma.leadStageChange.create({
      data: {
        leadId: existing.id,
        fromStage: existing.stage,
        toStage: parsed.data.stage,
        changedById: req.user!.id,
      },
    }),
  ]);
  res.json(lead);
});

const activitySchema = z.object({ text: z.string().min(1) });

// FR-2.5: attach free-text notes/activities to a lead.
leadsRouter.post("/:id/activities", async (req, res) => {
  const existing = await findScopedLead(req.params.id, req.user!);
  if (!existing) return res.status(404).json({ error: "Lead not found" });

  const parsed = activitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [activity] = await prisma.$transaction([
    prisma.activity.create({
      data: { leadId: existing.id, userId: req.user!.id, text: parsed.data.text },
    }),
    prisma.lead.update({ where: { id: existing.id }, data: { lastActivityAt: new Date() } }),
  ]);
  res.status(201).json(activity);
});
