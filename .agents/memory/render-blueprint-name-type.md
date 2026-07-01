---
name: Render Blueprint service name+type matching
description: Render creates a duplicate service if render.yaml name OR type doesn't match the existing service exactly — no error is raised.
---

## Rule
`render.yaml` `name` AND `type` must both match the live Render service exactly. A mismatch on either field causes Render Blueprint sync to create a **new** service silently rather than updating the existing one.

**Why:** Render treats (name, type) as the service identity key. Changing `type: worker` → `type: web` on the same name, or changing the name, both look like a brand-new service to the Blueprint engine.

**How to apply:** Before editing `render.yaml`, verify the service name and type in the Render dashboard. Current correct values:
- `name: Automailer, type: web` (serves HTTP — has booking webhook, admin routes, etc.)
- `name: Receptionist, type: web` (live at mia-voice-receptionist.onrender.com)

If duplicates appear: delete the unwanted ones from the Render dashboard, then fix render.yaml to match the survivors.
