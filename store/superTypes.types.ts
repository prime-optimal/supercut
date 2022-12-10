export type EditProps = {
  id: string;
  uploadId: string | null;
  playbackId: string | null;
  assetId: string | null;
  status: string | null;
  staticStatus: string | null;
  summaryStatus: string | null;
  assemblyId: string | null;
};

export type TranscriptionProps = {
  id: string;
  editId: string;
  assemblyId: string;
  text: string | null;
  words: WordProps[] | null;
  chapters: ChapterProps[] | null;
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

export type ChapterProps = {
  gist: string;
  summary: string;
  headline: string;
  start: number;
  end: number;
};
