export interface Slide {
  /** Path without size suffix: `${base}-sm.webp` (600w), `${base}-md.webp` (1000w), `${base}.webp` (1600w). */
  base: string;
  alt: string;
  width: number;
  height: number;
}

const P = "/media/home-carousel";

/** Province photographs for the home page carousel (photos only, no captions). */
export const slides: Slide[] = [
  { base: `${P}/slide-01`, alt: "Sisters and young women in formation with a priest before the chapel altar", width: 1600, height: 537 },
  { base: `${P}/slide-02`, alt: "Sisters, priests and guests seated at a Province celebration with students", width: 1600, height: 537 },
  { base: `${P}/slide-03`, alt: "Guests of honour seated at a Province celebration", width: 1052, height: 679 },
  { base: `${P}/slide-04`, alt: "Sisters at a Conference of Religious of India programme", width: 1600, height: 537 },
  { base: `${P}/slide-05`, alt: "Sisters of the Province with a priest at a gathering", width: 1600, height: 537 },
  { base: `${P}/slide-06`, alt: "Senior sisters of the Province together in a community hall", width: 1600, height: 537 },
  { base: `${P}/slide-07`, alt: "Sisters with young women in white before the chapel altar", width: 1600, height: 537 },
  { base: `${P}/slide-08`, alt: "Sisters gathered around a jubilarian at a jubilee celebration", width: 1600, height: 537 },
  { base: `${P}/slide-09`, alt: "Sisters with a visitor in the convent garden", width: 1600, height: 639 },
  { base: `${P}/slide-10`, alt: "Sisters of the Province gathered together holding flags", width: 1600, height: 537 },
];

