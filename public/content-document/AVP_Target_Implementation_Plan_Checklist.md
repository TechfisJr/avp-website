# AVP Corrected Process - Implementation Plan Checklist

Version date: 2026-07-23
Target source: supplied AVP process diagram

## Goal

Align the website to the actual nine-unit wood pellet production process:

```text
Raw material storage Unit
-> Woods chipping Unit
-> Wet grinding Unit
-> Buffer storage
-> Drying Unit
-> Recovery Unit
-> Dried grinding Unit
-> Pelletizer Unit
-> Finished product Unit
```

Do not treat value upgrading, torrefaction or Black Wood Pellet as required
steps in the core production line. They may remain only as optional downstream
extensions after Finished product Unit.

## Phase 0 - Alignment

Status: done

- [x] Confirm corrected process from the diagram.
- [x] Identify mismatch in previous plan: missing Buffer storage, missing
  Recovery Unit, only one grinding step, optional upgrade scenes placed inside
  the core story.
- [x] Decide to keep station ids stable during cleanup.

## Phase 1 - Copy And Documentation

Status: done

- [x] Update hero copy to introduce the nine-unit process.
- [x] Map S01 to Raw material storage Unit.
- [x] Keep S02 as a silent continuation slot.
- [x] Map S03 to Woods chipping Unit.
- [x] Map S04 to Wet grinding Unit.
- [x] Map S05 to Buffer storage.
- [x] Map S06 to Drying Unit.
- [x] Map S07 to Recovery Unit.
- [x] Map S08 to Dried grinding Unit.
- [x] Map S09 to Pelletizer Unit.
- [x] Map S10 to Finished product Unit.
- [x] Move S11-S14 into optional downstream extension language.
- [x] Update metadata in `src/app/layout.tsx`.
- [x] Update architecture, storyboard, timeline, motion and asset docs.
- [x] Run `npm run typecheck`.
- [x] Run `npm run build`.

## Phase 2 - Visual Rebuild

Status: first-pass done

- [x] Rebuild S05 visual as Buffer storage instead of dryer copy/legacy slot.
- [x] Rebuild S06 visual as Drying Unit.
- [x] Rebuild S07 visual as Recovery Unit with separator/cyclone/filter logic.
- [x] Rebuild S08 visual as Dried grinding Unit, distinct from Wet grinding.
- [x] Rebuild S09 visual as Pelletizer Unit.
- [x] Rebuild S10 visual as Finished product Unit.
- [ ] Re-check all bridges so material state is correct between units.
- [x] Keep all production cameras side or three-quarter side, never top-down.

## Phase 3 - Factory Continuity

Status: in progress

- [x] Add a large shared factory hall concept around chipping and later units.
- [ ] Keep chipping partly outside the hall and send chips into the warehouse
  interior.
- [ ] Route later machines deeper into the same factory instead of switching to
  isolated backgrounds.
- [ ] Remove/avoid columns that block key machine readability.

## Acceptance Criteria

- The visible copy follows the nine-unit diagram in order.
- Buffer storage appears after Wet grinding and before Drying.
- Recovery appears after Drying.
- Dried grinding appears after Recovery and before Pelletizer.
- Finished product is the endpoint of the core line.
- Optional upgrade scenes are clearly downstream after Unit 9.
- `npm run typecheck` passes.
- `npm run build` passes.
- Desktop and mobile screenshots confirm readable side/three-quarter views.
