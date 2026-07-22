import type { SectionCopy } from "./copy";

export type MediaSource = {
  mp4?: string;
  webm?: string;
};

export type ScrollWorldScene = SectionCopy & {
  scene: string;
  sceneLabel: string;
  accent: string;
  poster: string;
  mobilePoster?: string;
  video?: MediaSource;
  mobileVideo?: MediaSource;
  scrollWeight: number;
  emphasis?: boolean;
  assetStatus:
    | "available"
    | "needs-improvement"
    | "missing"
    | "optional";
};

export type ScrollWorldConnector = {
  id: string;
  from: string;
  to: string;
  poster: string;
  video?: MediaSource;
  mobileVideo?: MediaSource;
  scrollWeight: number;
  assetStatus:
    | "available"
    | "needs-improvement"
    | "missing"
    | "optional";
};

export type ScrollWorldEnvironment = {
  id: string;
  label: string;
  sceneLabel: string;
  firstStage: string;
  poster: string;
  mobilePoster?: string;
  video?: MediaSource;
  mobileVideo?: MediaSource;
  scrollWeight: number;
  accent: string;
  assetStatus:
    | "available"
    | "needs-improvement"
    | "missing"
    | "optional";
};

export const SCROLL_WORLD_SCENES: ScrollWorldScene[] = [
  {
    id: "sustainable-forest",
    scene: "forest-origin",
    sceneLabel: "Scene 01",
    eyebrow: "01 Sustainable Forest",
    headline: ["It begins", "with nature."],
    body: "Renewable energy begins with responsibly sourced biomass.",
    data: "Forest -> renewable biomass",
    tags: ["Responsible Origin", "Plantation Wood"],
    align: "left",
    accent: "#8bb56a",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    scrollWeight: 1.05,
    assetStatus: "needs-improvement",
  },
  {
    id: "raw-wood",
    scene: "forest-origin",
    sceneLabel: "Scene 01",
    eyebrow: "02 Raw Wood",
    headline: ["The raw", "material."],
    body: "Selected wood resources enter the production journey.",
    data: "Sustainable forest -> raw wood",
    tags: ["Acacia", "Wood Resources"],
    align: "right",
    accent: "#c98a42",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    scrollWeight: 0.95,
    assetStatus: "available",
  },
  {
    id: "wood-chips",
    scene: "wood-processing",
    sceneLabel: "Scene 02",
    eyebrow: "03 Wood Chips",
    headline: ["Reducing size.", "Preparing material."],
    body: "Wood is reduced into consistent chips, preparing the material for further processing.",
    data: "Raw wood -> chipping -> wood chips",
    tags: ["Industrial Chipping", "Uniform Feedstock"],
    align: "left",
    accent: "#e0a85c",
    poster: "/backgrounds/03-production/factory-interior-01.webp",
    scrollWeight: 1,
    assetStatus: "available",
  },
  {
    id: "wood-particles",
    scene: "wood-processing",
    sceneLabel: "Scene 02",
    eyebrow: "04 Wood Particles",
    headline: ["Refined", "for consistency."],
    body: "The biomass is further refined into smaller and more uniform particles.",
    data: "Wood chips -> grinding -> particles",
    tags: ["Hammer Mill", "Consistent Particle Size"],
    align: "right",
    accent: "#dfb273",
    poster: "/backgrounds/03-production/factory-interior-02.webp",
    scrollWeight: 1,
    assetStatus: "available",
  },
  {
    id: "dry-biomass",
    scene: "dry-biomass",
    sceneLabel: "Scene 03",
    eyebrow: "05 Dry Biomass",
    headline: ["Moisture", "under control."],
    body: "Controlled drying prepares the biomass for efficient densification.",
    data: "Wet biomass -> drying -> dry biomass",
    tags: ["Rotary Dryer", "Controlled Moisture"],
    align: "left",
    accent: "#d98f47",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    scrollWeight: 1.05,
    assetStatus: "available",
  },
  {
    id: "pelletization",
    scene: "pelletization",
    sceneLabel: "Scene 04",
    eyebrow: "06 Pelletization",
    headline: ["Pressure", "creates form."],
    body: "Under controlled pressure, prepared biomass is transformed into a compact and consistent solid fuel.",
    data: "Compression -> densification -> pellet",
    tags: ["Pellet Mill", "Cooling & Screening"],
    align: "right",
    accent: "#e85d26",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    scrollWeight: 1.15,
    assetStatus: "available",
  },
  {
    id: "white-wood-pellet",
    scene: "white-wood-pellet",
    sceneLabel: "Scene 05",
    eyebrow: "07 Wood Pellet",
    headline: ["Renewable energy.", "Densified."],
    body: "Natural biomass is transformed into a compact, consistent and transportable renewable fuel.",
    data: "The result of the first transformation",
    tags: ["White Wood Pellet", "Transportable Fuel"],
    align: "left",
    accent: "#f0c982",
    poster: "/backgrounds/03-production/factory-interior-05.webp",
    scrollWeight: 1,
    assetStatus: "needs-improvement",
  },
  {
    id: "thermal-upgrading",
    scene: "value-upgrading",
    sceneLabel: "Scene 06",
    eyebrow: "08 Thermal Upgrading",
    headline: ["Upgrading what", "biomass can become."],
    body: "Conventional wood pellets enter a carefully controlled thermal environment, beginning a new stage of material transformation.",
    data: "Wood pellet -> controlled heat",
    tags: ["Controlled Heat", "Sealed Treatment"],
    align: "right",
    accent: "#f26a2e",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    scrollWeight: 1.35,
    emphasis: true,
    assetStatus: "missing",
  },
  {
    id: "torrefaction",
    scene: "value-upgrading",
    sceneLabel: "Scene 06",
    eyebrow: "09 Torrefaction",
    headline: ["The color changes", "because the material changes."],
    body: "Through controlled thermal treatment, the internal characteristics of the biomass begin to change.",
    data: "Controlled treatment -> material transformation",
    tags: ["Torrefaction Reactor", "Material Upgrade"],
    align: "left",
    accent: "#c85b35",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    scrollWeight: 1.45,
    emphasis: true,
    assetStatus: "missing",
  },
  {
    id: "black-wood-pellet",
    scene: "value-upgrading",
    sceneLabel: "Scene 06",
    eyebrow: "10 Black Wood Pellet",
    headline: ["The pellet is not", "merely darkened."],
    body: "The pellet is upgraded into a higher-value biomass fuel with a premium charcoal-toned material identity.",
    data: "White pellet -> torrefaction -> black pellet",
    tags: ["Black Wood Pellet", "Higher-Value Energy"],
    align: "right",
    accent: "#d8a15a",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    scrollWeight: 1.35,
    emphasis: true,
    assetStatus: "missing",
  },
  {
    id: "advanced-bioenergy",
    scene: "advanced-bioenergy",
    sceneLabel: "Scene 07",
    eyebrow: "11 Advanced Bioenergy",
    headline: ["From responsible biomass", "to advanced bioenergy."],
    body: "AVP connects responsible wood resources, industrial technology and global renewable energy value.",
    data: "Responsible biomass -> advanced bioenergy",
    tags: ["Global Supply", "Renewable Energy"],
    align: "center",
    accent: "#86b869",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    scrollWeight: 1.2,
    assetStatus: "missing",
  },
];

export const SCROLL_WORLD_CONNECTORS: ScrollWorldConnector[] = [
  {
    id: "forest-origin-to-wood-processing",
    from: "forest-origin",
    to: "wood-processing",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-01-02.mp4",
      webm: "/scroll-world/videos/desktop/connector-01-02.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-01-02.mp4",
      webm: "/scroll-world/videos/mobile/connector-01-02.webm",
    },
    scrollWeight: 0.45,
    assetStatus: "missing",
  },
  {
    id: "wood-processing-to-dry-biomass",
    from: "wood-processing",
    to: "dry-biomass",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-02-03.mp4",
      webm: "/scroll-world/videos/desktop/connector-02-03.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-02-03.mp4",
      webm: "/scroll-world/videos/mobile/connector-02-03.webm",
    },
    scrollWeight: 0.38,
    assetStatus: "missing",
  },
  {
    id: "dry-biomass-to-pelletization",
    from: "dry-biomass",
    to: "pelletization",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-03-04.mp4",
      webm: "/scroll-world/videos/desktop/connector-03-04.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-03-04.mp4",
      webm: "/scroll-world/videos/mobile/connector-03-04.webm",
    },
    scrollWeight: 0.38,
    assetStatus: "missing",
  },
  {
    id: "pelletization-to-white-wood-pellet",
    from: "pelletization",
    to: "white-wood-pellet",
    poster: "/backgrounds/03-production/factory-interior-05.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-04-05.mp4",
      webm: "/scroll-world/videos/desktop/connector-04-05.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-04-05.mp4",
      webm: "/scroll-world/videos/mobile/connector-04-05.webm",
    },
    scrollWeight: 0.38,
    assetStatus: "missing",
  },
  {
    id: "white-wood-pellet-to-value-upgrading",
    from: "white-wood-pellet",
    to: "value-upgrading",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-05-06.mp4",
      webm: "/scroll-world/videos/desktop/connector-05-06.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-05-06.mp4",
      webm: "/scroll-world/videos/mobile/connector-05-06.webm",
    },
    scrollWeight: 0.5,
    assetStatus: "missing",
  },
  {
    id: "value-upgrading-to-advanced-bioenergy",
    from: "value-upgrading",
    to: "advanced-bioenergy",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-06-07.mp4",
      webm: "/scroll-world/videos/desktop/connector-06-07.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-06-07.mp4",
      webm: "/scroll-world/videos/mobile/connector-06-07.webm",
    },
    scrollWeight: 0.5,
    assetStatus: "missing",
  },
];

export const SCROLL_WORLD_ENVIRONMENTS: ScrollWorldEnvironment[] = [
  {
    id: "forest-origin",
    label: "Forest Origin",
    sceneLabel: "Scene 01",
    firstStage: "sustainable-forest",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/01-forest-origin.mp4",
      webm: "/scroll-world/videos/desktop/01-forest-origin.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/01-forest-origin.mp4",
      webm: "/scroll-world/videos/mobile/01-forest-origin.webm",
    },
    scrollWeight: 2,
    accent: "#8bb56a",
    assetStatus: "needs-improvement",
  },
  {
    id: "wood-processing",
    label: "Wood Processing",
    sceneLabel: "Scene 02",
    firstStage: "wood-chips",
    poster: "/backgrounds/03-production/factory-interior-01.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/02-wood-processing.mp4",
      webm: "/scroll-world/videos/desktop/02-wood-processing.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/02-wood-processing.mp4",
      webm: "/scroll-world/videos/mobile/02-wood-processing.webm",
    },
    scrollWeight: 2,
    accent: "#e0a85c",
    assetStatus: "needs-improvement",
  },
  {
    id: "dry-biomass",
    label: "Dry Biomass",
    sceneLabel: "Scene 03",
    firstStage: "dry-biomass",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/03-dry-biomass.mp4",
      webm: "/scroll-world/videos/desktop/03-dry-biomass.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/03-dry-biomass.mp4",
      webm: "/scroll-world/videos/mobile/03-dry-biomass.webm",
    },
    scrollWeight: 1.2,
    accent: "#d98f47",
    assetStatus: "needs-improvement",
  },
  {
    id: "pelletization",
    label: "Pelletization",
    sceneLabel: "Scene 04",
    firstStage: "pelletization",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/04-pelletization.mp4",
      webm: "/scroll-world/videos/desktop/04-pelletization.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/04-pelletization.mp4",
      webm: "/scroll-world/videos/mobile/04-pelletization.webm",
    },
    scrollWeight: 1.25,
    accent: "#e85d26",
    assetStatus: "needs-improvement",
  },
  {
    id: "white-wood-pellet",
    label: "White Pellet",
    sceneLabel: "Scene 05",
    firstStage: "white-wood-pellet",
    poster: "/backgrounds/03-production/factory-interior-05.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/05-white-wood-pellet.mp4",
      webm: "/scroll-world/videos/desktop/05-white-wood-pellet.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/05-white-wood-pellet.mp4",
      webm: "/scroll-world/videos/mobile/05-white-wood-pellet.webm",
    },
    scrollWeight: 1.1,
    accent: "#f0c982",
    assetStatus: "missing",
  },
  {
    id: "value-upgrading",
    label: "Value Upgrading",
    sceneLabel: "Scene 06",
    firstStage: "thermal-upgrading",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/06-value-upgrading.mp4",
      webm: "/scroll-world/videos/desktop/06-value-upgrading.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/06-value-upgrading.mp4",
      webm: "/scroll-world/videos/mobile/06-value-upgrading.webm",
    },
    scrollWeight: 4.15,
    accent: "#f26a2e",
    assetStatus: "missing",
  },
  {
    id: "advanced-bioenergy",
    label: "Bioenergy",
    sceneLabel: "Scene 07",
    firstStage: "advanced-bioenergy",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/07-advanced-bioenergy.mp4",
      webm: "/scroll-world/videos/desktop/07-advanced-bioenergy.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/07-advanced-bioenergy.mp4",
      webm: "/scroll-world/videos/mobile/07-advanced-bioenergy.webm",
    },
    scrollWeight: 1.35,
    accent: "#86b869",
    assetStatus: "missing",
  },
];
