"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
// Using dist path to avoid TypeScript casing conflict on Windows
import { Observer } from "gsap/dist/Observer";
import { useScrollContainer } from "@/app/context/ScrollContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

export function ScrollSnapController() {
  const scrollerRef = useScrollContainer();
  const observerRef = useRef<Observer | null>(null);

  useEffect(() => {
    if (!scrollerRef?.current) return;

    const scroller = scrollerRef.current;
    const sections = scroller.querySelectorAll<HTMLElement>(".story-section");

    if (sections.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    let currentIndex = 0;
    let isAnimating = false;

    const goToSection = (index: number) => {
      if (isAnimating || index < 0 || index >= sections.length) return;
      if (index === currentIndex) return;

      isAnimating = true;
      currentIndex = index;

      const target = sections[index];

      gsap.to(scroller, {
        scrollTop: target.offsetTop,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          isAnimating = false;
        },
      });
    };

    observerRef.current = Observer.create({
      target: scroller,
      type: "wheel,touch",
      tolerance: 10,
      preventDefault: true,
      onUp: () => {
        goToSection(currentIndex + 1);
      },
      onDown: () => {
        goToSection(currentIndex - 1);
      },
    });

    return () => {
      observerRef.current?.kill();
    };
  }, [scrollerRef]);

  return null;
}
