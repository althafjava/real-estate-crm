# Figma Design — Leads Dashboard

**Figma file:** [Real Estate CRM - UI Sample](https://www.figma.com/design/N5CXgOMvxk13rDSfGhiEsD)

## What's in it

A first UI mockup for the CRM, built directly in Figma via the Figma MCP connector (not a static image — real frames with auto-layout you can edit).

**Screen: "Leads Dashboard"** (1440x900)
- Left sidebar navigation: Dashboard, Leads (active), Contacts, Properties, Tasks, Reports
- Top bar: page title, active lead count, "+ New Lead" action
- Kanban-style pipeline board matching the FRD's pipeline stages:
  New -> Contacted -> Site Visit -> Negotiation -> Closed Won
- Each column holds sample lead cards (name, budget/location, source badge)
- Source badges color-coded by lead origin: 99acres, MagicBricks, Housing.com, Referral, Walk-in
  (directly reflecting the market research on where leads come from)

## Palette used

- Sidebar / primary: deep navy `#0F2A43`
- Active nav state: lighter navy `#1F3D5E`
- Page background: cool off-white `#F5F7FA`
- Accent / CTA: warm gold `#D9A441`
- Source badges: blue (99acres), amber (portal sources), neutral grey (referral/walk-in)

## Status

Draft v1 — approved as a direction, not yet built in React. Next design step (when we get there):
translate this into actual React components for the frontend, or add a second screen
(e.g. Property list / detail view).
