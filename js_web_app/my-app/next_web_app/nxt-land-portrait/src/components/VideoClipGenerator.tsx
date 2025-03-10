'use client'

import React, { useState, useEffect } from 'react';
import { InputSection } from './InputSection';
import { VideoPlayerSection } from './VideoPlayerSection';
import { GeneratedVideosGrid } from './GeneratedVideosGrid';

// Type definitions
export interface GeneratorState {
  isLoading: boolean;
  generatedVideos: string[];
  currentVideo: string;
  videoExists: boolean;
  currentProcessId?: string;
  scriptOutput?: string;
}

export interface VideoProcessResponse {
  output: string;
}

export interface ParsedOutput {
  videos?: string[];
  script_output?: string;
  process_id?: string;
}

const FLASK_SERVER = 'http://localhost:5001';

const VideoClipGenerator: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [availableResolutions, setAvailableResolutions] = useState<string[]>([]);
  const [resolution, setResolution] = useState<string>('');
  const [isLoadingResolutions, setIsLoadingResolutions] = useState(false);
  const [state, setState] = useState<GeneratorState>({
    isLoading: false,
    generatedVideos: [],
    currentVideo: `${FLASK_SERVER}/video/sim.mp4`,
    videoExists: false,
    currentProcessId: undefined
  });

  // Effect to fetch available resolutions when URL changes
  useEffect(() => {
    const fetchResolutions = async () => {
      if (!url) {
        console.log('No URL provided, clearing resolutions');
        setAvailableResolutions([]);
        setResolution('');
        return;
      }

      console.log('Fetching resolutions for URL:', url);
      setIsLoadingResolutions(true);

      try {
        console.log('Fetching resolutions for URL:', url);
        console.log('Sending request to:', `${FLASK_SERVER}/api/get-video-options`);
        
        const response = await fetch(`${FLASK_SERVER}/api/get-video-options`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url }),
          // Adding credentials if needed
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch resolutions');
        }

        const data = await response.json();
        setAvailableResolutions(data.resolutions || []);
        
        // Set default resolution if available
        if (data.resolutions && data.resolutions.length > 0) {
          setResolution(data.resolutions[0]);
        }
      } catch (error) {
        console.error('Error fetching resolutions:', error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          console.error('Network error - Is the Flask server running on port 5001?');
          alert('Unable to connect to the server. Please make sure the backend server is running.');
        }
        setAvailableResolutions([]);
        setResolution('');
      } finally {
        setIsLoadingResolutions(false);
      }
    };

    fetchResolutions();
  }, [url]);

  const handleUrlChange = (url: string): void => {
    setUrl(url);
  };

  const handleVideoSelect = (videoUrl: string): void => {
    setState(prev => ({
      ...prev,
      currentVideo: videoUrl,
      videoExists: true
    }));
  };

  const handleCancelDownload = async (): Promise<void> => {
    try {
      if (!state.currentProcessId) {
        console.warn('No active process to cancel');
        return;
      }

      const response = await fetch(
        `${FLASK_SERVER}/api/cancel-processing/${state.currentProcessId}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel processing');
      }

      // Clean up temporary files
      await fetch(`${FLASK_SERVER}/api/cleanup-temp-files`, { method: 'POST' });

      setState(prev => ({
        ...prev,
        isLoading: false,
        currentProcessId: undefined
      }));
    } catch (error) {
      console.error('Error cancelling download:', error);
      alert('Failed to cancel the download. Please try again.');
    }
  };

  const handleGenerate = async (): Promise<void> => {
    if (!url) {
      alert('Please enter a video URL');
      return;
    }

    if (!resolution) {
      alert('Please select a resolution');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch(`${FLASK_SERVER}/api/process-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, resolution }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process video');
      }

      const { output } = await response.json() as VideoProcessResponse;
      const parsedOutput = JSON.parse(output) as ParsedOutput;
      const newVideos = parsedOutput.videos || [];

      if (newVideos.length > 0) {
        try {
          const videoCheck = await fetch(newVideos[0], { method: 'HEAD' });
          setState(prev => ({
            ...prev,
            generatedVideos: newVideos,
            scriptOutput: parsedOutput.script_output || '',
            currentVideo: videoCheck.ok ? newVideos[0] : prev.currentVideo,
            videoExists: videoCheck.ok,
            isLoading: false,
            currentProcessId: parsedOutput.process_id
          }));
        } catch (error) {
          console.error('Error checking video:', error);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error('Error processing video:', error);
      alert(error instanceof Error ? error.message : 'Failed to process video. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <InputSection
          url={url}
          onUrlChange={handleUrlChange}
          isLoadingResolutions={isLoadingResolutions}
          availableResolutions={availableResolutions}
          resolution={resolution}
          onResolutionChange={setResolution}
          onGenerate={handleGenerate}
          onCancelDownload={handleCancelDownload}
          isLoading={state.isLoading}
        />
        <VideoPlayerSection
          videoExists={state.videoExists}
          currentVideo={state.currentVideo}
        />
        <GeneratedVideosGrid
          videos={state.generatedVideos}
          onVideoSelect={handleVideoSelect}
        />
      </div>
    </div>
  );
};

export default VideoClipGenerator;