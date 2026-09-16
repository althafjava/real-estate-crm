import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const contactsRouter = Router();

contactsRouter.use(requireAuth);

contactsRouter.get("/", async (req, res) => {
  const { search } = req.query;
  const contacts = await prisma.contact.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: String(search), mode: "insensitive" } },
            { phone: { contains: String(search) } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
  res.json(contacts);
});

const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().nullable(),
  type: z.enum(["BUYER", "SELLER", "TENANT", "OWNER"]),
});

// FR-3.3: warn on likely duplicate phone number instead of hard-blocking.
contactsRouter.post("/", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const duplicate = await prisma.contact.findFirst({ where: { phone: parsed.data.phone } });
  const contact = await prisma.contact.create({ data: parsed.data });
  res.status(201).json({ contact, duplicateWarning: duplicate ? { id: duplicate.id, name: duplicate.name } : null });
});

contactsRouter.get("/:id", async (req, res) => {
  const contact = await prisma.contact.findUnique({
    where: { id: req.params.id },
    include: { leads: true, ownedProperties: true },
  });
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  res.json(contact);
});

contactsRouter.patch("/:id", async (req, res) => {
  const parsed = contactSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const contact = await prisma.contact.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(contact);
});
