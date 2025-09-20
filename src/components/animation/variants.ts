import type { Variants, Transition } from "framer-motion";

export type VariantName = keyof typeof variantsMap;

// Vereinheitlichte Transition (aus Timeline): etwas ruhiger und konsistent über die App
export const defaultTransition: Transition = {
  duration: 0.75,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const defaultViewport = {
  once: true,
  amount: 0.05,
  margin: "-5% 0% -5% 0%",
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

// Zusätzliche, häufig genutzte Varianten aus dem Timeline-Modul
const containerStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const itemEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const cardEnter: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const bulletEnter: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
};

const textSlideInLeft: Variants = {
  hidden: { opacity: 0, x: -72 },
  visible: { opacity: 1, x: 0 },
};

const textSlideInRight: Variants = {
  hidden: { opacity: 0, x: 72 },
  visible: { opacity: 1, x: 0 },
};

const asidePop: Variants = {
  hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
};

export const variantsMap = {
  // generisch
  fadeInUp,
  fadeIn,
  fadeInDown,
  scaleIn,
  slideInLeft,
  slideInRight,
  // timeline-spezifisch (nun zentral verfügbar)
  containerStagger,
  itemEnter,
  cardEnter,
  bulletEnter,
  textSlideInLeft,
  textSlideInRight,
  asidePop,
};
