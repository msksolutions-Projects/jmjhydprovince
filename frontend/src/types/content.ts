export interface ContentHeading {
  level: number;
  title: string;
  id: string;
}

export interface ContentSection {
  title: string;
  slug: string;
  markdown: string;
  headings: ContentHeading[];
}

export interface ContentData {
  source: string;
  sections: ContentSection[];
}

export interface Institution {
  id: string;
  institution: string;
  established: string;
  type: string;
  courses: string;
  medium: string;
  intake: string;
}

export interface DirectoryEntry {
  title: string;
  location: string;
  state: string;
  lines: string[];
  address: string;
  phones: string[];
  emails: string[];
  founded: string;
  website: string;
}
