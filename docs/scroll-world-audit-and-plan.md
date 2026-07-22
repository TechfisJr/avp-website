# AVP Scroll-World Rebuild Audit and Plan

## A. Current Implementation Assessment

The current website is a Next.js 16 App Router project using a fixed React Three
Fiber canvas as the visual engine:

- `src/components/ExperienceLoader.tsx` dynamically loads `Experience`.
- `Experience` mounts a full scroll track, WebGL detection, `CanvasRoot`,
  `Overlay`, RFQ and floating contact UI.
- `CanvasRoot` runs one always-on R3F canvas with postprocessing.
- `World` composes 15 procedural stations and 13 transition bridges.
- `src/lib/timeline.ts`, `src/lib/copy.ts`, `src/lib/scrollStore.ts`, and
  `src/lib/gsapExperience.ts` drive scroll progress and overlay timing.

The scroll/content system is useful, but the realtime visual approach is too
heavy for the desired direction. Existing QA docs rate the R3F result below
production quality because several stations still read as placeholder geometry,
neighbor stations bleed into frames, and key copy is sometimes occluded.

Decision: replace the live visual engine with a scroll-scrubbed media chain.
Keep the old Three implementation in the repository until the new media chain is
verified end to end.

## B. Existing Asset Inventory

| Required element | Status | Existing source | Use |
| --- | --- | --- | --- |
| Forest | Needs improvement | `src/three/stations/Forest.tsx`, `docs/qa-shots/final-audit/d-01-forest.png` | Reference only |
| Plantation | Needs improvement | factory aerial surrounding landscape | Reference and partial poster fallback |
| Raw logs | Available | `public/backgrounds/02-factory-entry/factory-aerial.webp`, procedural logs | Production reference / fallback |
| Log transport | Needs improvement | procedural truck/log bridge | Reference only |
| Factory exterior | Available | `public/backgrounds/02-factory-entry/factory-aerial.webp` | Production fallback and render reference |
| Factory interior | Available | `public/backgrounds/03-production/factory-interior-01..05.webp` | Production fallback and render reference |
| Wood chipper | Missing | no strong dedicated asset | Generate |
| Wood chips | Available | interior chip piles, procedural chips | Reference / fallback |
| Conveyor | Available | factory interior conveyors, procedural conveyor kit | Reference / fallback |
| Hammer mill | Needs improvement | procedural grinder, interior machine line | Reference |
| Wood particles | Needs improvement | procedural fibers/particles | Reference |
| Rotary dryer | Needs improvement | procedural dryer, ducting photo `interior-04` | Reference |
| Dry biomass | Needs improvement | chip piles/fiber particles | Reference |
| Pellet mill | Needs improvement | procedural pelletizing scene, `interior-03` | Reference |
| Cooling system | Needs improvement | procedural cooler | Reference |
| Screening system | Needs improvement | procedural screen deck | Reference |
| White wood pellet | Needs improvement | hero pellet GLB, procedural pellet bed | Reference |
| Warehouse | Available | factory interiors with FIBC/bulk staging | Fallback / reference |
| Silo | Missing | no strong existing asset | Generate |
| Thermal upgrading equipment | Missing | procedural chamber only | Generate |
| Torrefaction reactor | Missing | procedural reactor only | Generate |
| White-to-black transformation | Missing | procedural gradient pellets only | Generate |
| Black wood pellet | Needs improvement | procedural black pellet hero | Reference |
| Logistics | Optional | legacy procedural ship/truck, factory aerial | Optional finale reference |
| Port | Missing | no existing production asset | Generate if included |
| Bulk vessel | Optional | legacy procedural cargo ship | Generate if included |
| Advanced bioenergy destination | Missing | no strong existing asset | Generate |

## C. Missing Asset List

Production-critical media still needed:

- 7 desktop scene clips, encoded as H.264 MP4 and WebM.
- 6 desktop connector clips whose first and last frames match the neighboring
  scene clips.
- 7 desktop poster WebP images, preferably extracted from the first frame of
  each final clip.
- Optional native 9:16 mobile chain: 7 mobile scene clips, 6 mobile connectors,
  and 7 portrait posters.

Highest-priority missing visuals:

- Scene 01 forest-origin clip with actual sustainable forest origin.
- Scene 06 value-upgrading clip with thermal upgrading, torrefaction and
  white-to-black material transformation.
- Scene 07 advanced-bioenergy clip with black pellet hero and global energy
  scale.

## D. Final 7-Scene Cinematic Storyboard

| Scene | Story stages | Scroll role |
| --- | --- | --- |
| 01 Forest Origin | Sustainable Forest, Raw Wood | Aerial reveal, canopy descent, renewable biomass/log yard, forward move to facility |
| 02 Wood Processing | Raw Wood, Wood Chips, Wood Particles | Low industrial tracking through receiving, chipping, conveyors and particle processing |
| 03 Dry Biomass | Dry Biomass | Follow material through rotary dryer, cyclone, ducts and dry biomass movement |
| 04 Pelletization | Pelletization | Conveyor/production-line tracking through conditioning, press, cooling and screening |
| 05 White Wood Pellet | Wood Pellet | Slow product hero around finished white pellets, silos and clean warehouse |
| 06 Value Upgrading | Thermal Upgrading, Torrefaction, Black Wood Pellet | Extended controlled technological push-through, white pellet input to black pellet output |
| 07 Advanced Bioenergy | Advanced Bioenergy | Black pellet hero to factory/logistics/port/energy-scale reveal |

## E. Migration Plan

1. Add a manifest-driven scroll-world media model for the 11 narrative stages
   and 7 major environments.
2. Replace the live page route with a fixed poster/video scrub viewport.
3. Keep typography, HUD, RFQ and contact UI as HTML/CSS overlays.
4. Implement lazy current/next video loading, poster fallback, reduced-motion
   still mode, mobile source selection and direct navigation.
5. Keep old R3F files untouched while the new system is verified.
6. When the final media chain is present and seams are manually verified,
   remove obsolete realtime Three code and dependencies.

## F. Exact Assets That Must Be Generated

### Shared Negative Prompt

No text, no labels, no signs, no logos, no watermark, no fantasy effects, no
cartoon style, no low-poly game style, no excessive smoke, no visible flame
unless contained as subtle controlled heat, no sci-fi architecture.

### Scene 01 - Forest Origin

Premium cinematic industrial realism with subtle stylized 3D quality, one
continuous forward camera take. A large sustainable managed acacia forest,
plantation rows, mature trees, forest road, timber collection area and raw logs
ready for transport. Begin high and wide above the forest, descend smoothly
through the canopy, move toward renewable biomass and raw wood, then continue
forward toward a modern processing facility visible ahead. Warm natural daylight,
deep realistic scale, subtle atmosphere, AVP green accents only as color mood.

### Connector 01 -> 02

Use the exact final frame of Scene 01 as the first frame and the exact first
frame of Scene 02 as the last frame. Continue forward from the forest road and
log yard into the biomass receiving yard and factory processing line. No camera
direction reversal.

### Scene 02 - Wood Processing

Premium cinematic industrial realism inside an AVP biomass receiving and
processing area connected to the exterior yard. Logs enter a production system;
show a credible wood chipper, conveyors, wood chips, hammer mill and particle
processing equipment as one connected material flow. Camera tracks low alongside
the line with strong foreground parallax from logs, belts and machinery.

### Connector 02 -> 03

Use the exact final frame of Scene 02 and exact first frame of Scene 03. Follow
the wood particles forward along conveyors into the drying system. Maintain
position, speed and direction.

### Scene 03 - Dry Biomass

Industrial drying line with rotary dryer, cyclone, ducts, conveyors and dry
biomass particles. Camera follows the biomass beside the dryer, with restrained
heat shimmer and very light warm haze. The process feels controlled and safe,
not fiery or smoky.

### Connector 03 -> 04

Use final Scene 03 frame and first Scene 04 frame. Biomass exits the dryer and
continues into the pellet production area.

### Scene 04 - Pelletization

Pellet mill production line with conditioning, pellet press, conveyor, cooling
and screening systems. Camera follows dry biomass into the pellet press and
reveals loose material becoming uniform cylindrical wood pellets. Low controlled
industrial tracking, warm process lighting, strong parallax, no isolated machine
beauty shots.

### Connector 04 -> 05

Use final Scene 04 frame and first Scene 05 frame. Follow newly formed pellets
from production machinery toward a cleaner finished-product area.

### Scene 05 - White Wood Pellet

Finished white wood pellets as premium industrial product. Include cooling line,
silos and modern warehouse context. Slow half-orbit around the white pellet hero
material, then stabilize into a forward move toward the value-upgrading system.
Clean, warm, premium, believable product lighting.

### Connector 05 -> 06

Use final Scene 05 frame and first Scene 06 frame. White pellets move forward
into advanced thermal upgrading. This connector must make the first
transformation feel complete before the second begins.

### Scene 06 - Value Upgrading / Torrefaction

Most important and longest sequence. Advanced thermal upgrading and torrefaction
facility integrated into the AVP production world. White pellets enter a
controlled thermal treatment system, pass through sealed equipment and a
torrefaction reactor, gradually darkening through realistic material change.
Show controlled heat, instrumentation, contained energy flow and premium
industrial lighting. Palette transitions from warm natural wood tones to deep
charcoal and refined black tones. End with a dramatic reveal of black wood
pellets. The transformation is technological and realistic, never fantasy.

### Connector 06 -> 07

Use final Scene 06 frame and first Scene 07 frame. Continue forward from the
black pellet reveal into the larger advanced bioenergy ecosystem.

### Scene 07 - Advanced Bioenergy

Black Wood Pellet as final hero product connected to AVP's global renewable
energy ecosystem. Include modern factory scale, bulk logistics, port, vessel or
industrial energy destination if practical. Camera moves from black pellet
product to a crane-up wide reveal that communicates scale, technology and
renewable energy. Final visual supports the message: from responsible biomass to
advanced bioenergy.

