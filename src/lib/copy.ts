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
    headline: ["One pellet.", "A complete", "energy cycle."],
    body: "Follow a single wood pellet from the forest floor to industrial fire — and back into the carbon cycle.",
    align: "center",
  },
  {
    id: "forest",
    eyebrow: "Origin",
    headline: ["The forest gives", "what it grows back."],
    body: "Our fiber comes from sawmill residues and certified thinnings. No tree is felled for fuel.",
    data: "100% residue & certified fiber",
    align: "left",
  },
  {
    id: "collection",
    eyebrow: "Raw material",
    headline: ["Nothing felled for fuel.", "Everything used."],
    body: "Logs, offcuts, chips and shavings are gathered at the forest edge and staged for the mill.",
    data: "Sawmill residues · forest thinnings",
    align: "right",
  },
  {
    id: "screening",
    eyebrow: "Screening",
    headline: ["Only clean fiber", "moves forward."],
    body: "Stones, metal and bark fines drop out on the first screen. The furnace never sees them.",
    data: "Contaminant removal ≥ 99%",
    align: "left",
  },
  {
    id: "grinding",
    eyebrow: "Grinding",
    headline: ["Force, measured", "to the millimeter."],
    body: "Hammer mills reduce chips to a uniform fiber — the geometry the die will demand later.",
    data: "Hammer mill · < 4 mm output",
    align: "right",
  },
  {
    id: "drying",
    eyebrow: "Drying",
    headline: ["Fire needs dry wood.", "We make it."],
    body: "A rotary drum takes green fiber from over half water to exactly what combustion wants.",
    data: "Moisture 55% → 10%",
    align: "left",
  },
  {
    id: "conditioning",
    eyebrow: "Conditioning",
    headline: ["Steam awakens", "the wood’s own glue."],
    body: "Heat and moisture soften lignin — nature’s binder. Nothing synthetic is ever added.",
    data: "Lignin activation · zero additives",
    align: "right",
  },
  {
    id: "pelletizing",
    eyebrow: "Pelletizing",
    headline: ["Pressure", "becomes product."],
    body: "Rollers force fiber through a rotating ring die. It exits as dense, gleaming pellets.",
    data: "≈ 300 bar through the die",
    align: "left",
  },
  {
    id: "cooling",
    eyebrow: "Cooling",
    headline: ["Heat leaves.", "Hardness stays."],
    body: "Counterflow air settles the pellets from die-hot to ambient, locking in durability.",
    data: "90 °C → ambient",
    align: "right",
  },
  {
    id: "qc",
    eyebrow: "Quality control",
    headline: ["Every batch", "interrogated."],
    body: "Fines are screened away; density, moisture and ash are certified before anything ships.",
    data: "ENplus A1 · Ø 6 mm · ≤ 10% H₂O",
    align: "left",
  },
  {
    id: "packaging",
    eyebrow: "Packaging",
    headline: ["Sealed", "at the source."],
    body: "Jumbo bags fill in a controlled stream — clean, dry, and traceable to the batch.",
    data: "1,000 kg jumbo bags",
    align: "right",
  },
  {
    id: "warehouse",
    eyebrow: "Storage",
    headline: ["Energy,", "resting."],
    body: "Covered storage keeps moisture out and quality constant until the vessel arrives.",
    data: "40,000 t covered capacity",
    align: "left",
  },
  {
    id: "logistics",
    eyebrow: "Logistics",
    headline: ["From our quay", "to your boiler."],
    body: "Truck, quay and bulk carrier — scheduled lanes across Asia and into Europe.",
    data: "FOB / CIF · Asia & EU lanes",
    align: "right",
  },
  {
    id: "energy",
    eyebrow: "Energy",
    headline: ["Coal’s replacement,", "already burning."],
    body: "Power stations co-fire and convert to pellets with minimal retrofit — same heat, cleaner cycle.",
    data: "−90% net CO₂ vs. coal",
    align: "left",
  },
  {
    id: "circular",
    eyebrow: "Circular economy",
    headline: ["The ash returns.", "The forest continues."],
    body: "Combustion releases only the carbon the forest just absorbed. The loop closes where we began.",
    data: "Carbon-neutral combustion loop",
    align: "center",
  },
];
