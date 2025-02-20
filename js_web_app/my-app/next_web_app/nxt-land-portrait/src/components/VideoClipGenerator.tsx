'use client'

import React, { useState, useEffect } from 'react';
import { InputSection } from './InputSection';
import { VideoPlayerSection } from './VideoPlayerSection';
import { GeneratedVideosGrid } from './GeneratedVideosGrid';
import { GeneratorState, VideoProcessResponse, ParsedOutput } from './types';

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
    videoExists: false
  });

  useEffect(() => {
    const fetchVideoOptions = async () => {
      if (!url) return;
      
      setIsLoadingResolutions(true);
      try {
        const response = await fetch(`${FLASK_SERVER}/api/get-video-options`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch video options');
        }

        const data = await response.json() as { success: boolean; qualities: string[] };
        if (data.success && data.qualities.length > 0) {
          setAvailableResolutions(data.qualities);
          setResolution(data.qualities[0]);
        }
      } catch (error) {
        console.error('Error fetching video options:', error);
      } finally {
        setIsLoadingResolutions(false);
      }
    };

    fetchVideoOptions();
  }, [url]);

  useEffect(() => {
    const checkVideo = async () => {
      if (state.currentVideo) {
        try {
          const response = await fetch(state.currentVideo, { method: 'HEAD' });
          setState(prev => ({ ...prev, videoExists: response.ok }));
        } catch (error) {
          setState(prev => ({ ...prev, videoExists: false }));
        }
      }
    };
    checkVideo();
  }, [state.currentVideo]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setAvailableResolutions([]);
    setResolution('');
  };

  const handleVideoSelect = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl, { method: 'HEAD' });
      if (response.ok) {
        setState(prev => ({
          ...prev,
          currentVideo: videoUrl,
          videoExists: true
        }));
      }
    } catch (error) {
      console.error('Error checking video:', error);
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