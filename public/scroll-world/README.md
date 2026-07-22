# Scroll-World Runtime Media

Drop final rendered media into these folders:

```txt
public/scroll-world/
├── videos/
│   ├── desktop/
│   │   ├── 01-forest-origin.mp4
│   │   ├── 01-forest-origin.webm
│   │   ├── 02-wood-processing.mp4
│   │   ├── 02-wood-processing.webm
│   │   ├── 03-dry-biomass.mp4
│   │   ├── 03-dry-biomass.webm
│   │   ├── 04-pelletization.mp4
│   │   ├── 04-pelletization.webm
│   │   ├── 05-white-wood-pellet.mp4
│   │   ├── 05-white-wood-pellet.webm
│   │   ├── 06-value-upgrading.mp4
│   │   ├── 06-value-upgrading.webm
│   │   ├── 07-advanced-bioenergy.mp4
│   │   ├── 07-advanced-bioenergy.webm
│   │   ├── connector-01-02.mp4
│   │   ├── connector-01-02.webm
│   │   ├── connector-02-03.mp4
│   │   ├── connector-02-03.webm
│   │   ├── connector-03-04.mp4
│   │   ├── connector-03-04.webm
│   │   ├── connector-04-05.mp4
│   │   ├── connector-04-05.webm
│   │   ├── connector-05-06.mp4
│   │   ├── connector-05-06.webm
│   │   ├── connector-06-07.mp4
│   │   └── connector-06-07.webm
│   └── mobile/
│       └── same filenames, rendered natively for 9:16
└── posters/
    └── first-frame WebP posters when the final video chain is rendered
```

Encode MP4 as H.264 with `+faststart`, no audio, and short GOPs for scrubbing.
Use lower-resolution, tighter-GOP mobile files for portrait devices.

