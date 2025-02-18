'use client'

import React, { useState, useEffect } from 'react';

interface VideoPlayerProps {
  videoPath: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoPath, title }) => {
  const [videoExists, setVideoExists] = useState(false);

  useEffect(() => {
    const checkVideo = async () => {
      try {
        const response = await fetch(videoPath, { method: 'HEAD' });
        setVideoExists(response.ok);
      } catch (error) {
        setVideoExists(false);
      }
    };
    checkVideo();
  }, [videoPath]);

  if (!videoExists) {
    return null;
  }

  return (
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
          key={videoPath}
        >
          <source src={videoPath} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Currently playing: {title || videoPath.split('/').pop()}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;