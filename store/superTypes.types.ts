export type EditProps = {
  id: string;
  uploadId: string | null;
  playbackId: string | null;
  assetId: string | null;
  status: string | null;
  staticStatus: string | null;
  summaryStatus: string | null;
  assemblyId: string | null;
  parentId?: string | null;
  start?: null | number;
  end?: null | number;
  headline?: null | string;
  summary?: null | string;
  gist?: null | string;
};

export type TranscriptionProps = {
  id: string;
  editId: string;
  assemblyId: string;
  text: string | null;
  words: WordProps[] | null;
  chapters: AssemblyChapterProps[] | null;
  duration: number | null;
  status: "queued" | "processing" | "completed" | "error";
};

export type WordProps = {
  confidence: number;
  end: number;
  speaker: null | string;
  start: number;
  text: string;
};

export type AssemblyChapterProps = {
  gist: string;
  summary: string;
  headline: string;
  start: number;
  end: number;
};

export type ChapterProps = {
  id: string;
  editId: string;
  gist: string;
  summary: string;
  headline: string;
  start: number;
  end: number;
  playbackId: string | null;
  assetId: string | null;
};
