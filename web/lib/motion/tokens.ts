/**
 * JS-side copies of the motion tokens in app/globals.css's `--ease-professional`
 * etc. — Framer Motion and GSAP need numeric/array values, not CSS custom
 * properties, so these must be kept in sync with globals.css by hand.
 */

/** Confident deceleration, no spring overshoot — keeps motion "business grade." */
export const EASE_PROFESSIONAL: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_PROFESSIONAL_GSAP = "power3.out";

export const DURATION_MICRO = 0.15;
export const DURATION_REVEAL = 0.5;
export const DURATION_COUNT = 1.4;
