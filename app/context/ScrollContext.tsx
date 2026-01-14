"use client";

import {
  createContext,
  useContext,
  useRef,
  RefObject,
  ReactNode,
} from "react";

interface ScrollProviderProps {
  children: ReactNode;
}

const ScrollContext = createContext<RefObject<HTMLDivElement | null> | null>(
  null
);

export function ScrollProvider({ children }: ScrollProviderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollContext.Provider value={scrollerRef}>
      <div ref={scrollerRef} className="story-scroll">
        {children}
      </div>
    </ScrollContext.Provider>
  );
}

export function useScrollContainer() {
  return useContext(ScrollContext);
}
