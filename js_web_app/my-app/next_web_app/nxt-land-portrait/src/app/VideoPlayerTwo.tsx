'use client'

import React from 'react';

const VideoPlayer: React.FC = () => {
  const videoPath = '/Users/mikress/flask_app/mac_version/FeatureTranscribe/clips/sim.mp4';  // Path relative to public directory

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
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
            >
              <source src={videoPath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Currently playing: Simulating the Human Race</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;