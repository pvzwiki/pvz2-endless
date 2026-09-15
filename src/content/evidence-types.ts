export type EvidenceEntry = {
  number: string;
  title: string;
  text: string;
  addresses: readonly string[];
};
export type ArticleEvidence = Record<string, EvidenceEntry>;
