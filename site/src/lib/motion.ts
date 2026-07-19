import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export const motionEase = {
  enter: "power3.out",
  exit: "power2.in",
  emphasized: "expo.out",
} as const;

export { gsap, ScrollTrigger, useGSAP };
