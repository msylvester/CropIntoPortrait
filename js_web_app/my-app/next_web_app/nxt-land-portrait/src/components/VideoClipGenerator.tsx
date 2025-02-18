'use client'

import React, { useState, useEffect } from 'react';

type Resolution = typeof RESOLUTIONS[number]['value'];

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

const RESOLUTIONS = [
  { label: '1080p60', value: '1080p60' },
  { label: '720p60', value: '720p60' },
  { label: '720p', value: '720p' },
  { label: '480p', value: '480p' },
  { label: '360p', value: '360p' },
  { label: 'Audio Only', value: 'audio' },
  { label: '144p', value: '144p' },
] as const;

const VideoClipGenerator: React.FC = () => {
  const FLASK_SERVER = 'http://localhost:5001';
  
  const [url, setUrl] = useState<string>('');
  const [resolution, setResolution] = useState<Resolution>(RESOLUTIONS[0].value);
  const [state, setState] = useState<GeneratorState>({
    isLoading: false,
    generatedVideos: [],
    currentVideo: `${FLASK_SERVER}/video/sim.mp4`,
    videoExists: false
  });

  // Check if video exists
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

  // Function to update current video
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
  
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('Sending request to:', `${FLASK_SERVER}/api/process-video`);
      const response = await fetch(`${FLASK_SERVER}/api/process-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          resolution 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process video');
      }
  
      const { output } = await response.json() as VideoProcessResponse;
      console.log('Received response:', output);
      const parsedOutput = JSON.parse(output) as ParsedOutput;
      console.log('Parsed output:', parsedOutput);
      
      const newVideos = parsedOutput.videos || [];
      console.log('New videos:', newVideos);
  
      if (newVideos.length > 0) {
        try {
          const videoCheck = await fetch(newVideos[0], { method: 'HEAD' });
          console.log('Video check result:', videoCheck.ok);
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
        }
      }
    } catch (error) {
      console.error('Error processing video:', error);
      alert(error instanceof Error ? error.message : 'Failed to process video. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  // const handleGenerate = async (): Promise<void> => {
  //   if (!url) {
  //     alert('Please enter a video URL');
  //     return;
  //   }

  //   setState(prev => ({ ...prev, isLoading: true }));
    
  //   try {
  //     const response = await fetch(`${FLASK_SERVER}/api/process-video`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ 
  //         url,
  //         resolution 
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Failed to process video');
  //     }

  //     const { output } = await response.json() as VideoProcessResponse;
  //     const parsedOutput = JSON.parse(output) as ParsedOutput;
      
  //     // Update state with new videos and set the first one as current
  //     const newVideos = parsedOutput.videos || [];
  //     if (newVideos.length > 0) {
  //       try {
  //         const videoCheck = await fetch(newVideos[0], { method: 'HEAD' });
  //         setState(prev => ({
  //           ...prev,
  //           generatedVideos: newVideos,
  //           scriptOutput: parsedOutput.script_output || '',
  //           currentVideo: videoCheck.ok ? newVideos[0] : prev.currentVideo,
  //           videoExists: videoCheck.ok,
  //           isLoading: false,
  //         }));
  //       } catch (error) {
  //         setState(prev => ({
  //           ...prev,
  //           generatedVideos: newVideos,
  //           scriptOutput: parsedOutput.script_output || '',
  //           isLoading: false,
  //         }));
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error processing video:', error);
  //     alert(error instanceof Error ? error.message : 'Failed to process video. Please try again.');
  //     setState(prev => ({ ...prev, isLoading: false }));
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Input Section */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Process New Video
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="videoUrl" 
                className="block text-sm font-medium text-gray-700"
              >
                Video URL
              </label>
              <input
                id="videoUrl"
                type="url"
                placeholder="Enter your video URL here"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="resolution" 
                className="block text-sm font-medium text-gray-700"
              >
                Resolution
              </label>
              <select
                id="resolution"
                value={resolution}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setResolution(e.target.value as Resolution)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 bg-white"
              >
                {RESOLUTIONS.map((res) => (
                  <option key={res.value} value={res.value}>
                    {res.label}
                  </option>
                ))}
              </select>
            </div>

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
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                'Process Video'
              )}
            </button>
          </div>
        </div>

        {/* Current Video Player - Only render if video exists */}
        {state.videoExists && (
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
        )}

        {/* Processing Output */}
        {/* {state.scriptOutput && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Processing Status
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm">
              {state.scriptOutput}
            </pre>
          </div>
        )} */}

        {/* Generated Videos Grid */}
        {state.generatedVideos.length > 0 && (
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
                    <video
                      className="w-full aspect-video"
                      preload="metadata"
                    >
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
        )}
      </div>
    </div>
  );
};

export default VideoClipGenerator;