export type SectionCopy = {
  id: string;
  eyebrow: string;
  headline: string[]; // one entry per masked line
  body?: string;
  data?: string;
  align: "left" | "right" | "center";
};

export const COPY: SectionCopy[] = [
  {
    id: "hero",
    eyebrow: "AVP Biomass",
    headline: ["From wood.", "To pellet.", "To higher value."],
    body: "A journey that begins with natural biomass and evolves through technology into advanced bioenergy.",
    align: "center",
  },
  {
    id: "forest",
    eyebrow: "Sustainable forest",
    headline: ["It begins", "with nature."],
    body: "Renewable energy begins with responsibly sourced biomass.",
    data: "Forest → renewable biomass",
    align: "left",
  },
  {
    id: "collection",
    eyebrow: "Raw wood",
    headline: ["The raw", "material."],
    body: "Selected wood resources enter the production journey.",
    data: "Acacia · wood resources · residues",
    align: "right",
  },
  {
    id: "screening",
    eyebrow: "Wood chips",
    headline: ["Reducing size.", "Preparing material."],
    body: "Wood is reduced into consistent chips, preparing the material for further processing.",
    data: "Raw wood → chipping → wood chips",
    align: "left",
  },
  {
    id: "grinding",
    eyebrow: "Wood particles",
    headline: ["Refined", "for consistency."],
    body: "The biomass is further refined into smaller and more uniform particles.",
    data: "Wood chips → grinding → particles",
    align: "right",
  },
  {
    id: "drying",
    eyebrow: "Dry biomass",
    headline: ["Moisture", "under control."],
    body: "Controlled drying prepares the biomass for efficient densification.",
    data: "Wet biomass → drying → dry biomass",
    align: "left",
  },
  {
    id: "conditioning",
    eyebrow: "Preparation",
    headline: ["Precision begins", "before pelletization."],
    body: "The material is conditioned for a stable transformation under pressure.",
    data: "Prepared biomass · ready for densification",
    align: "right",
  },
  {
    id: "pelletizing",
    eyebrow: "Pelletizing",
    headline: ["Pressure", "creates form."],
    body: "Under controlled pressure, prepared biomass is transformed into a compact and consistent solid fuel.",
    data: "Compression → densification → pellet",
    align: "left",
  },
  {
    id: "cooling",
    eyebrow: "Wood pellet",
    headline: ["Renewable energy.", "Densified."],
    body: "Natural biomass is transformed into a compact, consistent and transportable renewable fuel.",
    data: "The result of the first transformation",
    align: "right",
  },
  {
    id: "qc",
    eyebrow: "Value upgrading",
    headline: ["More than", "a transformation."],
    body: "The journey continues beyond conventional wood pellets into a new layer of value.",
    data: "Product → technology → higher value",
    align: "left",
  },
  {
    id: "packaging",
    eyebrow: "Thermal upgrading",
    headline: ["Upgrading what", "biomass can become."],
    body: "Conventional wood pellets enter a carefully controlled thermal environment.",
    data: "Wood pellet → controlled heat",
    align: "right",
  },
  {
    id: "warehouse",
    eyebrow: "Torrefaction",
    headline: ["The technology behind", "the transformation."],
    body: "Through controlled thermal treatment, the internal characteristics of biomass begin to change.",
    data: "Heat changes structure",
    align: "left",
  },
  {
    id: "logistics",
    eyebrow: "Value creation",
    headline: ["The pellet is not", "merely darkened."],
    body: "Technology transforms an established biomass product into a higher-value energy material.",
    data: "White pellet → technology → black pellet",
    align: "right",
  },
  {
    id: "energy",
    eyebrow: "Black wood pellet",
    headline: ["Biomass.", "Upgraded."],
    body: "The result of manufacturing plus technology: a new generation of solid bioenergy.",
    data: "The result of the second transformation",
    align: "left",
  },
  {
    id: "circular",
    eyebrow: "Advanced bioenergy",
    headline: ["We create", "more value from it."],
    body: "From natural resources to pelletization, then through technology into a higher-value energy product.",
    data: "Wood → pellet → higher value",
    align: "center",
  },
];
