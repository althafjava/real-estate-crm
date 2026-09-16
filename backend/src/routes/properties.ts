import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const propertiesRouter = Router();

propertiesRouter.use(requireAuth);

// FR-4.4: filter/search by status, type, location, and price range.
propertiesRouter.get("/", async (req, res) => {
  const { status, type, location, minPrice, maxPrice } = req.query;
  const properties = await prisma.property.findMany({
    where: {
      status: status ? (String(status) as any) : undefined,
      type: type ? (String(type) as any) : undefined,
      location: location ? { contains: String(location), mode: "insensitive" } : undefined,
      price: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
    },
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(properties);
});

const propertySchema = z.object({
  title: z.string().min(1),
  type: z.enum(["APARTMENT", "VILLA", "PLOT", "COMMERCIAL"]),
  location: z.string().min(1),
  price: z.number().positive(),
  area: z.number().positive().optional().nullable(),
  bedrooms: z.number().int().nonnegative().optional().nullable(),
  bathrooms: z.number().int().nonnegative().optional().nullable(),
  status: z.enum(["AVAILABLE", "HOLD", "SOLD", "RENTED"]).default("AVAILABLE"),
  photoUrls: z.array(z.string().url()).default([]),
  ownerId: z.string().uuid().optional().nullable(),
});

propertiesRouter.post("/", async (req, res) => {
  const parsed = propertySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const property = await prisma.property.create({ data: parsed.data });
  res.status(201).json(property);
});

propertiesRouter.get("/:id", async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
    include: { owner: true, interestedLeads: true },
  });
  if (!property) return res.status(404).json({ error: "Property not found" });
  res.json(property);
});

propertiesRouter.patch("/:id", async (req, res) => {
  const parsed = propertySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const property = await prisma.property.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(property);
});
