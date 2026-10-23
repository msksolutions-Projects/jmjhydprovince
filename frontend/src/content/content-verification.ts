/**
 * Unresolved factual conflicts in the source content.
 *
 * These are recorded rather than silently corrected. Nothing listed here may
 * be published as settled fact until the provincial office confirms it.
 * `publicValue` is what the site is permitted to show in the meantime —
 * `null` means the fact must be omitted entirely.
 */
export interface ContentVerificationItem {
  id: string;
  topic: string;
  conflict: string;
  sources: string[];
  /** Safe value to display now, or null if the fact must be withheld. */
  publicValue: string | null;
  status: "unresolved" | "resolved";
}

export const contentVerification: ContentVerificationItem[] = [
  {
    id: "arrival-date-1904",
    topic: "Arrival of the first missionary sisters in India",
    conflict: "Given as 24 February 1904 in one section and 28 February 1904 in another.",
    sources: ["Education", "Missionary Work"],
    publicValue: "February 1904",
    status: "unresolved",
  },
  {
    id: "gajwel-founding",
    topic: "St. Joseph's High School, Gajwel — Telugu medium founding year",
    conflict: "1983 on the institution page, 1989 in the institutions master table.",
    sources: ["St. Joseph's High School, Gajwel", "Institutions master table"],
    publicValue: null,
    status: "unresolved",
  },
  {
    id: "kurnool-hospital-founding",
    topic: "St. Theresa's General Hospital, Kurnool — founding year",
    conflict: "1923 in the master table, 1924 in the nursing institute account.",
    sources: ["Institutions master table", "St. Theresa's General Hospital, Kurnool"],
    publicValue: null,
    status: "unresolved",
  },
  {
    id: "tlc-home-founding",
    topic: "St. Theresa's Tender Loving Care Home — founding year",
    conflict:
      "Narrative states the home began in 1986; the master table records 1999, which is the year the purpose-built building was inaugurated.",
    sources: ["St. Theresa's T.L.C. Home", "Institutions master table"],
    publicValue: null,
    status: "unresolved",
  },
  {
    id: "province-division-1987",
    topic: "Division of the Indian Province in 1987",
    conflict:
      "Described as creating three provinces on the history page; four provinces are referenced elsewhere, with Raipur apparently erected later.",
    sources: ["Our History", "JMJ Social Service Society", "JMJ Convent, Bhopal"],
    publicValue: null,
    status: "unresolved",
  },
  {
    id: "wholeness-centre-spelling",
    topic: "JMJ Wholeness Centre, Mahabubnagar",
    conflict: 'Menu spells it "Whelleness Centre"; the body text uses "Wholeness Centre" throughout.',
    sources: ["Navigation", "JMJ Wellness Centre, Mahabubnagar"],
    publicValue: "JMJ Wholeness Centre",
    status: "unresolved",
  },
  {
    id: "sanathnagar-headmistress-terms",
    topic: "St. Theresa's Girls High School — head mistress terms",
    conflict: "Several terms overlap: 1971–1975, 1972–1976 and 1975–1976.",
    sources: ["St. Theresa's Girls High School, Sanathnagar"],
    publicValue: null,
    status: "unresolved",
  },
  {
    id: "sister-name-spellings",
    topic: "Sisters' names recorded with two spellings",
    conflict:
      "Nirmala / Mirmala Jaddu · Premeela / Prameela Yadlapalli · Celine Alpat / Alapat.",
    sources: ["Province Commissions", "Provincial Superiors"],
    publicValue: null,
    status: "unresolved",
  },
  {
    id: "apostolate-count",
    topic: "Apostolate list",
    conflict:
      '"Evangelization" and "Pastoral and Evangelization" appear as separate entries — unclear whether these are one commission or two.',
    sources: ["Home — Our Ministries"],
    publicValue: null,
    status: "unresolved",
  },
  {
    id: "missionary-sister-names",
    topic: "Names of the seven pioneer sisters",
    conflict: "Several names were garbled in the source and need checking against Province records.",
    sources: ["Missionary Work"],
    publicValue: null,
    status: "unresolved",
  },
];

export const unresolvedCount = contentVerification.filter((i) => i.status === "unresolved").length;

/** Look up whether a given fact is safe to publish. */
export const verificationFor = (id: string) => contentVerification.find((i) => i.id === id);
