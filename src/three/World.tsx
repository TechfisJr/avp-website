"use client";

import type { Quality } from "@/lib/quality";
import CameraRig from "./CameraRig";
import Atmosphere from "./Atmosphere";
import HeroPellet from "./HeroPellet";
import Hero from "./stations/Hero";
import Forest from "./stations/Forest";
import Collection from "./stations/Collection";
import Screening from "./stations/Screening";
import Grinding from "./stations/Grinding";
import Drying from "./stations/Drying";
import Conditioning from "./stations/Conditioning";
import Pelletizing from "./stations/Pelletizing";
import Cooling from "./stations/Cooling";
import QualityControl from "./stations/QualityControl";
import Packaging from "./stations/Packaging";
import Warehouse from "./stations/Warehouse";
import Logistics from "./stations/Logistics";
import Energy from "./stations/Energy";
import Circular from "./stations/Circular";
import ForestToCollection from "./bridges/ForestToCollection";
import PelletizingToCooling from "./bridges/PelletizingToCooling";
import TorrefactionToValueCreation from "./bridges/TorrefactionToValueCreation";

export default function World({ quality }: { quality: Quality }) {
  const q = quality;
  return (
    <>
      <CameraRig quality={q} />
      <Atmosphere />
      <HeroPellet />
      <Hero quality={q} />
      <Forest quality={q} />
      <Collection quality={q} />
      <Screening quality={q} />
      <Grinding quality={q} />
      <Drying quality={q} />
      <Conditioning quality={q} />
      <Pelletizing quality={q} />
      <Cooling quality={q} />
      <QualityControl quality={q} />
      <Packaging quality={q} />
      <Warehouse quality={q} />
      <Logistics quality={q} />
      <Energy quality={q} />
      <Circular quality={q} />
      <ForestToCollection />
      <PelletizingToCooling />
      <TorrefactionToValueCreation />
    </>
  );
}
