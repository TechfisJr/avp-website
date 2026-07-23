# AVP Scroll World Current Media Audit

## Asset Availability Matrix

| Visual need | Status | Existing asset/reference | Implementation use |
| --- | --- | --- | --- |
| Sustainable forest hero | Missing | R3F forest screenshots only | Current fallback uses factory aerial; generate dedicated forest plate/video |
| Raw wood / log transition | Available but weak | `factory-aerial.webp`, procedural logs screenshots | Existing aerial/log yard supports fallback; needs close raw-log motion |
| Chipping process | Missing | Interior conveyor photos, procedural screen/chip screenshots | CSS chip stream fallback; generate actual chipping sequence |
| Actual wood chips | Available | Interior chip piles, procedural chip screenshots | Reused as fallback/reference |
| Grinding / wood particles | Available but weak | `factory-interior-02.webp`, procedural grinder/fibers | CSS foreground and flow animation; needs close refining media |
| Drying process | Available but weak | `factory-interior-04.webp`, procedural dryer screenshot | Reused with dryer/heat foreground; generate better dryer/cyclone clip |
| Pelletization close-up | Available but weak | `factory-interior-03.webp`, procedural pelletizing screenshot | Reused with press/pellet foreground; needs close compression clip |
| White wood pellet macro | **Production asset available** | `public/product/white-pellet.webp` (from `01.png`) | Real transparent-PNG pile → WebP, composited as the White Pellet hero (stage 07) with drop-shadow over the soft-focus scene. |
| Thermal upgrading equipment | Missing | Procedural chamber screenshots | CSS reactor/heat fallback; generate proper controlled thermal facility |
| Torrefaction transformation | **Production asset available** | `white-pellet.webp` + `torrefied-pellet.webp` + `black-pellet.webp` (`01/02/03.png`) | Three matched real pellet shots, identical composition; scroll-driven crossfade + expanding radial mask (White→Brown→Black), reversible. |
| Black wood pellet hero | **Production asset available** | `public/product/black-pellet.webp` (from `03.png`) | Real black/torrefied pile → WebP, composited as the Black Pellet hero (stage 10). |
| Bioenergy / logistics final scene | Missing | Factory aerial, legacy ship screenshot | CSS port/vessel fallback; generate final ecosystem scene |
| Native 9:16 mobile media | Needs mobile version | Desktop 16:9 photos only | Responsive crop/foreground fallback; generate portrait clips later |

> **Reference vs production asset.** Real-world pellet reference photos were
> supplied and catalogued in `docs/pellet-reference-audit.md` (organised under
> `public/references/pellets/`). They are **visual references only** — used to
> derive geometry/colour for the procedural pellet material, NOT shipped as final
> assets. The three pellet rows above are therefore "reference available" but a
> licensed/owned/generated production photo or clip is still the ideal final
> deliverable. The former "giant striped oval" pellet has been fully removed.

## Generation Prompts

Use the same style for every asset:

Premium cinematic industrial realism with subtle stylized 3D qualities,
physically believable materials, realistic AVP-scale biomass production, warm
natural wood tones, controlled industrial lighting, deep depth, foreground
parallax, high-end corporate sustainability aesthetic. No text, no labels, no
signs, no logos, no watermark, no fantasy effects, no sci-fi machinery, no
unrealistic fire, no excessive smoke.

### A. Forest Origin Cinematic Plate

Create a cinematic 16:9 scene of a sustainable managed acacia forest connected
to a biomass production facility. Start visually from living forest: plantation
rows, mature trees, forest road, subtle morning atmosphere. Include harvested
renewable biomass and raw logs in the distance, with a processing facility only
as a believable destination. Camera feeling: wide aerial drift descending toward
the canopy and then forward toward raw wood collection. Natural daylight, warm
green and wood tones, strong depth, no text or signage.

### B. Wood Processing Material Sequence

Create a cinematic 16:9 industrial biomass processing scene inside a warm AVP
factory environment. Raw logs enter chipping machinery, conveyors carry visible
wood chips, and the line continues toward grinding/refining equipment. The image
must show material transformation from logs to chips to smaller particles in one
connected production line, with strong foreground parallax and believable
machinery scale. No labels, no logos, no fake signage.

### C. White Wood Pellet Macro Hero

Create a premium 16:9 macro hero scene of finished white wood pellets in a clean
industrial warehouse/silo context. The foreground shows uniform cylindrical
light wood pellets with compressed fiber texture, dry and clean, not dusty or
burned. Background includes subtle cooling line, silo or finished product
handling in soft focus. Camera feeling: slow product reveal, polished industrial
lighting, first major climax of production.

### D. Thermal Upgrading / Torrefaction Scene

Create a cinematic 16:9 advanced thermal upgrading facility for biomass pellets.
White wood pellets enter sealed controlled thermal processing equipment with a
torrefaction reactor, instrumentation, ducts and contained warm treatment light.
The environment is premium industrial realism, not futuristic science fiction.
Show controlled heat and subtle heat haze, no flames or explosions, no smoke
clouds, no text or labels.

### E. White To Intermediate To Black Pellet Transformation

Create a 16:9 transformation reference showing three realistic biomass pellet
states across a controlled torrefaction process: natural light white wood
pellet, thermally transformed brown/dark intermediate pellet, finished deep
black wood pellet. The pellets should be cylindrical, compressed-fiber material,
premium and clean, not charred ash. Use subtle thermal atmosphere and industrial
lighting. The transformation must feel reversible by scroll and technology-led,
not magical.

### F. Black Wood Pellet Macro Hero

Create a premium 16:9 macro hero scene of black wood pellets as an advanced
biomass fuel. The pellets are deep charcoal/black, clean, dense, cylindrical,
with subtle compressed fiber texture and a refined low-sheen surface. Background
is dark premium industrial environment with controlled warm highlights and no
fire. This is the second major product climax.

### G. Logistics / Port / Bulk Vessel Final Scene

Create a cinematic 16:9 final ecosystem scene connecting black wood pellets to
global renewable energy value. Show black pellet material in the foreground,
AVP-scale industrial facility, bulk logistics, port infrastructure and a bulk
vessel or renewable energy destination in the distance. Camera feeling:
crane-up/aerial pullback communicating scale, technology and global energy
value. No text, no labels, no logos.

### H. Native 9:16 Mobile Transformation Scenes

Create portrait 9:16 versions of A, C, D, E and F, composed natively for mobile.
Keep critical machinery and pellet transformation in the upper/middle visual
field, leaving clean negative space in the lower third for HTML text overlays.
Do not crop from desktop. No text, no labels, no logos.

## Connector Clip Prompts

For every connector, use the actual final frame of the previous rendered scene
as the first reference and the actual first frame of the next rendered scene as
the second reference. Preserve camera position, forward direction, lens feeling,
lighting, architecture and material placement. The connector must continue
forward, never reverse direction.

1. Forest Origin -> Wood Processing: move from forest/log-yard approach into
   the biomass receiving and chipping line.
2. Wood Processing -> Dry Biomass: follow chips/particles along conveyors into
   dryer and cyclone infrastructure.
3. Dry Biomass -> Pelletization: follow dry biomass from dryer outlet into
   conditioning and pellet press.
4. Pelletization -> White Wood Pellet: move from pellet output/cooling toward a
   clean finished product area.
5. White Wood Pellet -> Value Upgrading: slow down around white pellet product,
   darken the atmosphere, and enter controlled thermal upgrading equipment.
6. Value Upgrading -> Advanced Bioenergy: move from black pellet reveal into
   AVP industrial scale, logistics and global energy value.

