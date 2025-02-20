'use client'

// components/VideoClipGenerator.tsx

import React, { useState, useEffect } from 'react';
import { InputSection } from './InputSection';
import { VideoPlayerSection } from './VideoPlayerSection';
import { GeneratedVideosGrid } from './GeneratedVideosGrid';
import { GeneratorState, VideoProcessResponse, ParsedOutput } from './types';
// Constants
const FLASK_SERVER = 'http://localhost:5001';

// Types
interface GeneratorState {
  isLoading: boolean;
  generatedVideos: string[];
  scriptOutput?: string;
  currentVideo?: string;
  videoExists: boolean;
}

interface VideoProcessResponse {
  output: string;
}

interface ParsedOutput {
  videos?: string[];
  script_output?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface VideoOptions {
  qualities: string[];
  raw_output: string;
}

const VideoClipGenerator: React.FC = () => {
  // State
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

  // Fetch available resolutions when URL changes
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
          setResolution(data.qualities[0]); // Set first available resolution as default
        }
      } catch (error) {
        console.error('Error fetching video options:', error);
        // alert('Failed to fetch available video qualities. Please try again.');
      } finally {
        setIsLoadingResolutions(false);
      }
    };

    fetchVideoOptions();
  }, [url]);

  // Video existence check
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

  // Handlers
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setAvailableResolutions([]); // Reset resolutions when URL changes
    setResolution(''); // Reset selected resolution
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

  // UI Components
  const InputSection = () => (
    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Process New Video
      </h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
            Video URL
          </label>
          <input
            id="videoUrl"
            type="url"
            placeholder="Enter your video URL here"
            value={url}
            onChange={handleUrlChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
          />
        </div>

        {isLoadingResolutions && (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {availableResolutions.length > 0 && (
          <div className="space-y-2">
            <label htmlFor="resolution" className="block text-sm font-medium text-gray-700">
              Available Resolutions
            </label>
            <select
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 bg-white"
            >
              {availableResolutions.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </div>
        )}

        {availableResolutions.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={state.isLoading}
            className={`
              w-full py-3 px-6 rounded-lg font-medium text-white
              transition-all duration-200
              ${state.isLoading 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 hover:shadow-lg'
              }
            `}
          >
            {state.isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                <span>Processing...</span>
              </div>
            ) : (
              'Process Video'
            )}
          </button>
        )}
      </div>
    </div>
  );

  const VideoPlayer = () => (
    state.videoExists && (
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Video Player
        </h1>
        
        <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
          <video
            controls
            className="w-full h-full"
            autoPlay={false}
            preload="metadata"
            key={state.currentVideo}
          >
            <source src={state.currentVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Currently playing: {state.currentVideo?.split('/').pop()}</p>
        </div>
      </div>
    )
  );

  const GeneratedVideosGrid = () => (
    state.generatedVideos.length > 0 && (
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Generated Clips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.generatedVideos.map((videoUrl, index) => (
            <div 
              key={index} 
              className="space-y-2 cursor-pointer" 
              onClick={() => handleVideoSelect(videoUrl)}
            >
              <div className="rounded-lg overflow-hidden shadow-lg">
                <video className="w-full aspect-video" preload="metadata">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="text-sm text-gray-600 break-all">
                Clip {index + 1}: {videoUrl.split('/').pop()}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <InputSection />
        <VideoPlayer />
        <GeneratedVideosGrid />
      </div>
    </div>
  );
};

export default VideoClipGenerator;