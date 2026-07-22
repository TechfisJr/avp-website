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
    headline: ["It begins", "with nature"],
    body: "Renewable energy begins with responsibly sourced biomass.",
    data: "Nature provides the resource. Technology creates the value.",
    tags: ["Responsible Origin", "Plantation Wood"],
    align: "left",
  },
  {
    id: "raw-wood",
    eyebrow: "02 Raw Wood",
    headline: ["The raw", "material"],
    body: "Selected wood resources enter the production journey.",
    data: "Sustainable forest -> raw wood",
    tags: ["Acacia", "Wood Resources"],
    align: "right",
  },
  {
    id: "wood-chips",
    eyebrow: "03 Wood Chips",
    headline: ["Reducing size.", "Preparing the material."],
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
    headline: ["Moisture", "under control"],
    body: "Controlled drying prepares the biomass for efficient densification.",
    data: "Precision begins before pelletization.",
    tags: ["Rotary Dryer", "Controlled Moisture"],
    align: "left",
  },
  {
    id: "pelletization",
    eyebrow: "06 Pelletization",
    headline: ["Pressure", "creates form"],
    body: "Under controlled pressure, prepared biomass is transformed into a compact and consistent solid fuel.",
    data: "Compression -> densification -> pellet",
    tags: ["Pellet Mill", "Cooling & Screening"],
    align: "right",
  },
  {
    id: "white-wood-pellet",
    eyebrow: "07 Wood Pellet",
    headline: ["Renewable energy.", "Densified."],
    body: "Natural biomass transformed into a compact, consistent and transportable renewable fuel.",
    data: "The result of the first transformation",
    tags: ["White Wood Pellet", "Transportable Fuel"],
    align: "left",
  },
  {
    id: "thermal-upgrading",
    eyebrow: "08 Thermal Upgrading",
    headline: ["Advanced thermal", "upgrading"],
    body: "Upgrading what biomass can become. Conventional wood pellets enter a carefully controlled thermal environment.",
    data: "Value is no longer created by form alone.",
    tags: ["Controlled Heat", "Sealed Treatment"],
    align: "right",
  },
  {
    id: "torrefaction",
    eyebrow: "09 Torrefaction",
    headline: ["Torrefaction"],
    body: "The technology behind the transformation. The color changes because the material changes.",
    data: "This is not simply a change in color. It is a change in the material.",
    tags: ["Torrefaction Reactor", "Material Upgrade"],
    align: "left",
  },
  {
    id: "black-wood-pellet",
    eyebrow: "10 Black Wood Pellet",
    headline: ["Black wood pellet"],
    body: "Biomass. Upgraded. The result of manufacturing plus technology and the second transformation.",
    data: "A new layer of value creation.",
    tags: ["Black Wood Pellet", "Higher-Value Energy"],
    align: "right",
  },
  {
    id: "advanced-bioenergy",
    eyebrow: "11 Advanced Bioenergy",
    headline: ["From natural resources", "to advanced bioenergy"],
    body: "Built from responsible resources. Shaped by technology. Created for higher-value advanced bioenergy.",
    data: "From wood. To pellet. To higher value.",
    tags: ["Industrial Scale", "Global Energy Value"],
    align: "center",
  },
];
