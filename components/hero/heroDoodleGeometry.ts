/** Scene geometry shared by the frames (server) and the doodle hook (client). */
/*
 * Scene viewBox, cropped to the lying pose (y 345…765, ground line included) so the drawing itself
 * is 124 px tall in the layout (Figma 1398:61452, 213 × 124) and the 100 px hero padding is measured
 * to the drawing, not to empty canvas. The original file used "-60 160 1000 660"; the sitting pose and
 * the squash-and-stretch rise above the box and stay visible (overflow: visible).
 */
export const VIEW_BOX = "-60 345 1000 420";
export const SCENE_HEIGHT = 124; // px
export const SCENE_WIDTH = (SCENE_HEIGHT * 1000) / 420; // ≈ 295 px
/** The sitting drawing is laid out 680 units to the right of the lying one. */
export const SIT_DX = -680;
/** Squash and stretch origin: on the ground under the body. */
export const GROUND = 757;
export const CX = 420;
/** Neutral ink from the current Figma hero (1490:38671), shared by every animated pose. */
export const INK = "#c7c7cc";
/** Background knock-out under each frame. */
export const PAPER = "var(--portfolio-bg-page)";
/** Everything the first paint doesn't need (other foot frames, the sitting pose): see scripts/gen-hero-doodle-rest.mjs. */
export const REST_URL = "hero/doodle-rest.json";
