'use client'

import React from 'react';

interface VideoPlayerProps {
  videoPath: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoPath, title }) => {
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
              key={videoPath} // Force reload when path changes
            >
              <source src={videoPath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Currently playing: {title || videoPath.split('/').pop()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;