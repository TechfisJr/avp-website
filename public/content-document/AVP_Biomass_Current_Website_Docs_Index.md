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

The target narrative is now applied in code:

- Live copy updated in `src/lib/copy.ts`
- Metadata updated in `src/app/layout.tsx`
- No-WebGL fallback updated in `src/components/NoWebGL.tsx`
- Late-stage visuals rebuilt for Value Upgrading, Thermal Upgrading,
  Torrefaction, Value Creation, Black Wood Pellet and Advanced Bioenergy
- Asset inventory consolidated to `public/asset-manifest.json`

Next implementation priority:

1. Finish technical/docs cleanup and remove obsolete references.
2. Run full QA: typecheck, build and visual smoke.
3. Decide later whether to rename legacy station filenames after QA is stable.

## Cleanup rule

Keep `content-document` lean. Do not add separate migration notes unless they
contain decisions that are not already captured in the checklist.
