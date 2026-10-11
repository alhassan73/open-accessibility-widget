"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Milliseconds to wait after the element enters the viewport (stagger siblings with it). */
  delay?: number;
  as?: "div" | "li" | "section";
}

/**
 * A short fade-and-rise for content that starts below the fold. Content is visible by default: only an
 * element that is off-screen when the page loads is hidden (`.reveal-pending`, see globals.css) and it is
 * shown as soon as one pixel of it scrolls into view. Elements already on screen are never touched, and
 * nothing is hidden without JS, when printing or with reduced motion.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // in view (or above it) at load

    el.classList.add("reveal-pending");
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      el.classList.remove("reveal-pending");
      observer.disconnect();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.classList.remove("reveal-pending");
    };
  }, []);

  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;
  return createElement(as, { ref, className: cn("reveal", className), style }, children);
}
