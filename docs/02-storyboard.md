# 02 - Storyboard

One continuous shot. `t` = global scroll progress 0 -> 1 across 15 stations.
Phase 1 keeps the existing world path and station ids, but the narrative now
follows the supplied AVP Wood Pellet process diagram.

The core production story ends at Unit 9, Finished product Unit. Any
torrefaction, value upgrading or black-pellet content must be treated as a
separate downstream extension after the finished product, not as part of the
core process.

---

### S00 - HERO - "From raw wood to finished pellets" (t 0.00-0.07)

Black void. A single pellet establishes the complete nine-unit production line:
raw material storage, chipping, wet grinding, buffer storage, drying, recovery,
dried grinding, pelletizing and finished product.
**Camera:** slow push-in from 6m -> 3.2m, slight side/three-quarter drift.
**Transition out:** particles pull the viewer toward the receiving/storage
yard.

### S01 - RAW MATERIAL STORAGE UNIT (t 0.07-0.145)

Logs arrive by truck and are staged in the raw material storage/receiving area.
This is Unit 1 and the first visible process beat.
**Camera:** side or three-quarter side view, no top-down framing.

### S02 - SILENT CONTINUATION (t 0.145-0.215)

No standalone content card. This spacer lets the truck/storage beat settle
before the chipping line takes over.
**Camera:** continue the same yard-to-factory direction.

### S03 - WOODS CHIPPING UNIT (t 0.215-0.285)

The chipping machine reduces logs into controlled wood chips. The chipper should
sit partially outside the large factory hall, with the discharge conveyor
throwing chips into the warehouse interior.
**Camera:** stable side/three-quarter factory-line view.

### S04 - WET GRINDING UNIT (t 0.285-0.355)

Wood chips are ground while moisture is still present. This first grinding step
creates wet particles before buffer storage.
**Camera:** side view at machine/operator height.

### S05 - BUFFER STORAGE (t 0.355-0.425)

Wet-ground material is temporarily held so the downstream drying unit receives a
stable feed. This beat must come before drying.
**Camera:** show buffer volume, feeder path and handoff toward drying.

### S06 - DRYING UNIT (t 0.425-0.49)

Buffered biomass enters the drying unit and moisture is reduced to the target
range for pellet production.
**Camera:** tracking shot along the dryer or drying line, side/three-quarter.

### S07 - RECOVERY UNIT (t 0.49-0.565)

The recovery unit separates usable dried material from dust and off-size
fractions before final particle refinement.
**Camera:** side view with collector/cyclone/filter logic readable.

### S08 - DRIED GRINDING UNIT (t 0.565-0.63)

Recovered dry biomass is ground a second time. This is distinct from wet
grinding and prepares final pellet feed consistency.
**Camera:** side view, no overhead reveal.

### S09 - PELLETIZER UNIT (t 0.63-0.70)

Prepared dry particles are compressed through the pelletizer to form dense,
consistent wood pellets.
**Camera:** side/three-quarter view of feed entering and pellets exiting.

### S10 - FINISHED PRODUCT UNIT (t 0.70-0.765)

Finished wood pellets are collected as the core output of the line, ready for
quality handling, storage or shipment.
**Camera:** readable finished-product reveal without implying torrefaction.

### S11 - OPTIONAL UPGRADE PATH (t 0.765-0.825)

Only after the finished product unit can the story branch into value upgrading.
This is not one of the nine required units.

### S12 - OPTIONAL TORREFACTION (t 0.825-0.89)

If included, torrefaction is a downstream thermal-treatment option after normal
wood pellet production is complete.

### S13 - BLACK WOOD PELLET (t 0.89-0.945)

Black wood pellet is presented as an advanced product after finished pellets,
not as the required output of the base process.

### S14 - ADVANCED BIOENERGY (t 0.945-1.00)

Final brand close: first the correct nine-unit line, then any optional
technology extension.

---

## Process Mapping Notes

| Core unit | Station slot | Requirement |
|---|---|---|
| 1. Raw material storage Unit | S01 forest | Receiving/storage yard starts the process |
| 2. Woods chipping Unit | S03 screening | Realistic chipper beside a large factory hall |
| 3. Wet grinding Unit | S04 grinding | First grinding step, before buffer |
| 4. Buffer storage | S05 drying | Buffer must sit after wet grinding and before drying |
| 5. Drying Unit | S06 conditioning | Moisture control after buffer |
| 6. Recovery Unit | S07 pelletizing | Recover usable dry material |
| 7. Dried grinding Unit | S08 cooling | Second grinding step after recovery |
| 8. Pelletizer Unit | S09 qc | Pellet formation |
| 9. Finished product Unit | S10 packaging | Core product endpoint |

Station ids are legacy implementation slots. Do not rename them until visual
QA is stable.
