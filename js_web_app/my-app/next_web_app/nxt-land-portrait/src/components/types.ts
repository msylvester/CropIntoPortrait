// types.ts
export interface GeneratorState {
  isLoading: boolean;
  generatedVideos: string[];
  scriptOutput?: string;
  currentVideo?: string;
  videoExists: boolean;
  currentProcessId?: string;  // Added this line
}

export interface VideoProcessResponse {
  output: string;
}

export interface ParsedOutput {
  videos?: string[];
  script_output?: string;
  process_id?: string;  // Added this line
}

export interface InputSectionProps {
  url: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoadingResolutions: boolean;
  availableResolutions: string[];
  resolution: string;
  onResolutionChange: (value: string) => void;
  onGenerate: () => Promise<void>;
  onCancelDownload: () => Promise<void>;  // Changed to required and async
  isLoading: boolean;
}

export interface VideoPlayerSectionProps {
  videoExists: boolean;
  currentVideo?: string;
}

export interface GeneratedVideosGridProps {
  videos: string[];
  onVideoSelect: (videoUrl: string) => void;
}