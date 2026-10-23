/**
 * The new client albums are formation and Province-event collections. They do
 * not identify individual institution buildings, schools or hospitals.
 * Until matching photos are supplied, display a labelled graphic instead of
 * falsely presenting an event or another institution as a particular house.
 */
const PLACEHOLDER = "/brand/institution-placeholder.svg";

const FORMATION = [
  "/media/client-2026/aspirancy/1MIs1ZJGxf-D8kglb0uH0R8atZSi1GeCW.webp",
  "/media/client-2026/postulency/1sYg5bX9alhqe2xkjSK2V_aW86xY52-jf.webp",
  "/media/client-2026/novices/1b4A_QVRtmMc2H9GVexKHZs66yPGBg3h4.webp",
];

export function institutionImage(...args: [id: string, type: string]): string {
  return /novitiate|formation|postulancy/i.test(args[1]) ? FORMATION[2] : PLACEHOLDER;
}

/** No new institution-specific photograph has yet been supplied. */
const verifiedInstitutionPhotoIds = new Set<string>();
export const hasOwnPhotograph = (id: string) => verifiedInstitutionPhotoIds.has(id);

/** The formation stages may be shown as clearly identified Province examples. */
export function institutionGallery(type: string): string[] {
  return /novitiate|formation|postulancy/i.test(type) ? FORMATION : [];
}
