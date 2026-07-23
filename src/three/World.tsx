"use client";

import type { Quality } from "@/lib/quality";
import CameraRig from "./CameraRig";
import Atmosphere from "./Atmosphere";
import HeroPellet from "./HeroPellet";
import MegaFactoryHall from "./environment/MegaFactoryHall";
import Hero from "./stations/Hero";
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
import CollectionToScreening from "./bridges/CollectionToScreening";
import ScreeningToGrinding from "./bridges/ScreeningToGrinding";
import GrindingToDrying from "./bridges/GrindingToDrying";
import DryingToConditioning from "./bridges/DryingToConditioning";
import ConditioningToPelletizing from "./bridges/ConditioningToPelletizing";
import PelletizingToCooling from "./bridges/PelletizingToCooling";
import CoolingToValueUpgrading from "./bridges/CoolingToValueUpgrading";
import ValueUpgradingToThermal from "./bridges/ValueUpgradingToThermal";
import ThermalToTorrefaction from "./bridges/ThermalToTorrefaction";
import TorrefactionToValueCreation from "./bridges/TorrefactionToValueCreation";
import ValueCreationToBlackPellet from "./bridges/ValueCreationToBlackPellet";
import BlackPelletToAdvancedBioenergy from "./bridges/BlackPelletToAdvancedBioenergy";

export default function World({ quality }: { quality: Quality }) {
  const q = quality;
  return (
    <>
      <CameraRig quality={q} />
      <Atmosphere />
      <HeroPellet />
      <MegaFactoryHall />
      <Hero quality={q} />
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
      <CollectionToScreening />
      <ScreeningToGrinding />
      <GrindingToDrying />
      <DryingToConditioning />
      <ConditioningToPelletizing />
      <PelletizingToCooling />
      <CoolingToValueUpgrading />
      <ValueUpgradingToThermal />
      <ThermalToTorrefaction />
      <TorrefactionToValueCreation />
      <ValueCreationToBlackPellet />
      <BlackPelletToAdvancedBioenergy />
    </>
  );
}
