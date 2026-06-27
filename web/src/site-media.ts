/** Shared media paths for marketing sections. */
export const MEDIA = {
  heroOrigin: "/media/hero/hero-origin-1280.webp",
  heroOriginWide: "/media/hero/hero-origin-1920.webp",
  heroMiner: "/media/hero-miner.webp",
  layerSubject: "/media/hero/layer-subject.webp",
  layerBack: "/media/hero/layer-back.webp",
  layerFront: "/media/hero/layer-front.webp",
  depthBack: "/media/hero-depth-back.webp",
  depthFront: "/media/hero-depth-front.webp",
  footerMine: "/media/footer-mine-exploration.png",
} as const;

export type MediaKey = keyof typeof MEDIA;
