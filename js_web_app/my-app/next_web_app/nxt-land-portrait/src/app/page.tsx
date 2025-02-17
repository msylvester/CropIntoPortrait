'use client'

import React, { useState } from 'react';

interface GeneratorState {
  isLoading: boolean;
  generatedVideos: string[];
}

const VideoClipGenerator = () => {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<GeneratorState>({
    isLoading: false,
    generatedVideos: [],
  });

  const handleGenerate = async () => {
    if (!url) {
      alert('Please enter a video URL');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('http://localhost:5001/api/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to process video');
      }

      const data = await response.json();
      const parsedOutput = JSON.parse(data.output);
      
      setState(prev => ({
        ...prev,
        generatedVideos: parsedOutput.videos,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error processing video:', error);
      alert('Failed to process video. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Input Section */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Video Clip Generator
          </h1>
          
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
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
              />
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

        {/* Video Grid */}
        {state.generatedVideos.length > 0 && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Generated Clips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.generatedVideos.map((videoUrl, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                  <video
                    controls
                    className="w-full aspect-video"
                    preload="metadata"
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
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