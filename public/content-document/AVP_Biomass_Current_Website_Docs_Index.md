# AVP Website Content Documents - Index

Version date: 2026-07-23

## Direction

The website should follow the actual AVP Wood Pellet production flow:

```text
1. Raw material storage Unit
2. Woods chipping Unit
3. Wet grinding Unit
4. Buffer storage
5. Drying Unit
6. Recovery Unit
7. Dried grinding Unit
8. Pelletizer Unit
9. Finished product Unit
```

Torrefaction, value upgrading and Black Wood Pellet are optional downstream
extensions after Unit 9. They are not part of the core production line.

## Required Docs

| File | Use |
|---|---|
| `AVP_Wood_Pellet_3D_Storytelling_Content_Final.md` | Corrected storytelling source for the 9-unit process |
| `AVP_Target_Implementation_Plan_Checklist.md` | Execution checklist for copy, station mapping, visual rebuilds and QA |

## Current Implementation Status

- Live copy updated in `src/lib/copy.ts`.
- Metadata updated in `src/app/layout.tsx`.
- Architecture, storyboard, timeline, motion and asset docs updated under
  `docs/`.
- Station ids remain legacy implementation slots until visual QA is stable.
- The existing optional upgrade scenes may stay after Unit 9, but they must not
  be presented as part of the core nine-unit flow.

## Next Priority

1. Rebuild visual slots S05-S10 to match Buffer, Drying, Recovery, Dried
   Grinding, Pelletizer and Finished Product.
2. Keep the factory as one large continuous hall from chipping into later
   machines.
3. Re-run typecheck, build and visual screenshots after each station rebuild.
