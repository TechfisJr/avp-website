# AVP Website Content Documents — Index

Version date: 2026-07-21

## Direction

The website should follow:

```text
FROM WOOD.
TO PELLET.
TO HIGHER VALUE.
```

The target narrative is defined by:

`AVP_Wood_Pellet_3D_Storytelling_Content_Final.md`

## Required docs

| File | Use |
|---|---|
| `AVP_Wood_Pellet_3D_Storytelling_Content_Final.md` | Target storytelling source |
| `AVP_Target_Implementation_Plan_Checklist.md` | Execution checklist for content, 3D, timeline, QA and docs cleanup |

## Current implementation status

Phase 1 is already applied in code:

- Live copy updated in `src/lib/copy.ts`
- Metadata updated in `src/app/layout.tsx`
- No-WebGL fallback updated in `src/components/NoWebGL.tsx`

Next implementation priority:

1. Rebuild Torrefaction scene.
2. Rebuild Black Wood Pellet product hero.
3. Rebuild Thermal Upgrading controlled environment.
4. Reframe Value Upgrading transition.
5. Reframe final Advanced Bioenergy close.

## Cleanup rule

Keep `content-document` lean. Do not add separate migration notes unless they
contain decisions that are not already captured in the checklist.

