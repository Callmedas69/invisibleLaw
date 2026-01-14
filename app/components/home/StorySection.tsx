"use client";

import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollContainer } from "@/app/context/ScrollContext";

gsap.registerPlugin(ScrollTrigger);

interface StorySectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function StorySection({
  children,
  className = "",
  id,
}: StorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useScrollContainer();

  useGSAP(
    () => {
      if (!scrollerRef?.current || !contentRef.current) return;

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        // Skip animation, just show content
        gsap.set(contentRef.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: scrollerRef.current,
            start: "top 80%",
            end: "top 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { dependencies: [scrollerRef], scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`story-section flex items-center justify-center px-8 sm:px-8 lg:px-12 ${className}`}
    >
      <div
        ref={contentRef}
        className="max-w-4xl mx-auto w-full max-h-full overflow-y-auto py-16"
      >
        {children}
      </div>
    </section>
  );
}
