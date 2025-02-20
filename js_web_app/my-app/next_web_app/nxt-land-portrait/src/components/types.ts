// types.ts
export interface GeneratorState {
  isLoading: boolean;
  generatedVideos: string[];
  scriptOutput?: string;
  currentVideo?: string;
  videoExists: boolean;
}

export interface VideoProcessResponse {
  output: string;
}

export interface ParsedOutput {
  videos?: string[];
  script_output?: string;
}

export interface InputSectionProps {
  url: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoadingResolutions: boolean;
  availableResolutions: string[];
  resolution: string;
  onResolutionChange: (value: string) => void;
  onGenerate: () => Promise<void>;
  onCancelDownload?: () => void;  // Added new prop
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