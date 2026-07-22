export type SectionCopy = {
  id: string;
  eyebrow: string;
  headline: string[];
  body?: string;
  data?: string;
  tags?: string[];
  align: "left" | "right" | "center";
};

export const COPY: SectionCopy[] = [
  {
    id: "sustainable-forest",
    eyebrow: "01 Sustainable Forest",
    headline: ["It begins", "with nature."],
    body: "Renewable energy begins with responsibly sourced biomass.",
    data: "Forest -> renewable biomass",
    tags: ["Responsible Origin", "Plantation Wood"],
    align: "left",
  },
  {
    id: "raw-wood",
    eyebrow: "02 Raw Wood",
    headline: ["The raw", "material."],
    body: "Selected wood resources enter the production journey.",
    data: "Sustainable forest -> raw wood",
    tags: ["Acacia", "Wood Resources"],
    align: "right",
  },
  {
    id: "wood-chips",
    eyebrow: "03 Wood Chips",
    headline: ["Reducing size.", "Preparing material."],
    body: "Wood is reduced into consistent chips, preparing the material for further processing.",
    data: "Raw wood -> chipping -> wood chips",
    tags: ["Industrial Chipping", "Uniform Feedstock"],
    align: "left",
  },
  {
    id: "wood-particles",
    eyebrow: "04 Wood Particles",
    headline: ["Refined", "for consistency."],
    body: "The biomass is further refined into smaller and more uniform particles.",
    data: "Wood chips -> grinding -> particles",
    tags: ["Hammer Mill", "Consistent Particle Size"],
    align: "right",
  },
  {
    id: "dry-biomass",
    eyebrow: "05 Dry Biomass",
    headline: ["Moisture", "under control."],
    body: "Controlled drying prepares the biomass for efficient densification.",
    data: "Wet biomass -> drying -> dry biomass",
    tags: ["Rotary Dryer", "Controlled Moisture"],
    align: "left",
  },
  {
    id: "pelletization",
    eyebrow: "06 Pelletization",
    headline: ["Pressure", "creates form."],
    body: "Under controlled pressure, prepared biomass is transformed into a compact and consistent solid fuel.",
    data: "Compression -> densification -> pellet",
    tags: ["Pellet Mill", "Cooling & Screening"],
    align: "right",
  },
  {
    id: "white-wood-pellet",
    eyebrow: "07 Wood Pellet",
    headline: ["Renewable energy.", "Densified."],
    body: "Natural biomass is transformed into a compact, consistent and transportable renewable fuel.",
    data: "The result of the first transformation",
    tags: ["White Wood Pellet", "Transportable Fuel"],
    align: "left",
  },
  {
    id: "thermal-upgrading",
    eyebrow: "08 Thermal Upgrading",
    headline: ["Upgrading what", "biomass can become."],
    body: "Conventional wood pellets enter a carefully controlled thermal environment, beginning a new stage of material transformation.",
    data: "Wood pellet -> controlled heat",
    tags: ["Controlled Heat", "Sealed Treatment"],
    align: "right",
  },
  {
    id: "torrefaction",
    eyebrow: "09 Torrefaction",
    headline: ["The color changes", "because the material changes."],
    body: "Through controlled thermal treatment, the internal characteristics of the biomass begin to change.",
    data: "Controlled treatment -> material transformation",
    tags: ["Torrefaction Reactor", "Material Upgrade"],
    align: "left",
  },
  {
    id: "black-wood-pellet",
    eyebrow: "10 Black Wood Pellet",
    headline: ["The pellet is not", "merely darkened."],
    body: "The pellet is upgraded into a higher-value biomass fuel with a premium charcoal-toned material identity.",
    data: "White pellet -> torrefaction -> black pellet",
    tags: ["Black Wood Pellet", "Higher-Value Energy"],
    align: "right",
  },
  {
    id: "advanced-bioenergy",
    eyebrow: "11 Advanced Bioenergy",
    headline: ["From responsible biomass", "to advanced bioenergy."],
    body: "AVP connects responsible wood resources, industrial technology and global renewable energy value.",
    data: "Responsible biomass -> advanced bioenergy",
    tags: ["Global Supply", "Renewable Energy"],
    align: "center",
  },
];
