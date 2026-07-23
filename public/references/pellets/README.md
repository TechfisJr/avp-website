# Pellet reference assets

These are **visual references only** — used to derive realistic geometry,
proportion, colour and texture for the procedural pellet material in the scroll
world. They are **not** shipped as final website assets (see
`docs/pellet-reference-audit.md`).

## How to place the supplied images

The reference photos were supplied inline in chat, so they could not be written
to disk automatically. Save each pasted image into the folder below using the
target filename (classification details in `docs/pellet-reference-audit.md`):

| Pasted image (in order) | Save to |
| --- | --- |
| 1 — plantation forest / road / mist | `../environment/forest-plantation-ref-01.jpg` *(bonus, not a pellet)* |
| 2 — white \| black split macro | `macro/pellet-macro-ref-01.jpg` |
| 3 — golden wood chips + conveyor | `../environment/wood-chips-ref-01.jpg` *(bonus)* |
| 4 — stacked raw logs | `../environment/raw-wood-ref-01.jpg` *(bonus)* |
| 5 — hands holding white pellets | `white/white-pellet-ref-01.jpg` |
| 6 — white pellet mound (shallow DoF) | `white/white-pellet-ref-02.jpg` + `pile/pellet-pile-ref-01.jpg` |
| 7 — black pellet pile | `black/black-pellet-ref-01.jpg` |
| 8 — pellets in rusty industrial bin | `industrial-context/pellet-industrial-ref-01.jpg` |
| 9 — white pellets on conveyor | `industrial-context/pellet-industrial-ref-02.jpg` |

`intermediate/` currently has no direct reference — the intermediate torrefied
state is derived by interpolating between the white (IMG 6) and black (IMG 7)
material truths.

## Do not
- Do not publish these third-party photos as final production website assets.
- Do not overwrite originals; keep this folder as the reference of record.
