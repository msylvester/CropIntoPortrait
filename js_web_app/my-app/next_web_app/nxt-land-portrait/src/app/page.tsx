'use client'

import React, { useState, useEffect } from 'react';

const SAMPLE_VIDEOS = [
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
];

const VideoClipGenerator = () => {
  // Move useState inside useEffect to avoid hydration mismatch
  const [state, setState] = useState({
    isLoading: false,
    generatedVideos: [],
  });

  // Handle client-side initialization
  useEffect(() => {
    // Initialize state on client side only
    setState({
      isLoading: false,
      generatedVideos: [],
    });
  }, []);

  const handleGenerate = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call with a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get 3 random videos
      const shuffled = [...SAMPLE_VIDEOS].sort(() => 0.5 - Math.random());
      const selectedVideos = shuffled.slice(0, 3);
      
      setState(prev => ({
        ...prev,
        generatedVideos: selectedVideos,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error generating clips:', error);
      alert('Failed to generate clips. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Early return while component is hydrating
  if (typeof window === 'undefined') {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Input Section */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Video Clip Generator
          </h1>
          
          <div className="space-y-6">
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
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Random Clips'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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