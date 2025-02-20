  
  // components/VideoPlayerSection.tsx
  import React from 'react';
  import { VideoPlayerSectionProps } from './types';
  
  export const VideoPlayerSection: React.FC<VideoPlayerSectionProps> = ({
    videoExists,
    currentVideo
  }) => (
    videoExists && (
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
            key={currentVideo}
          >
            <source src={currentVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Currently playing: {currentVideo?.split('/').pop()}</p>
        </div>
      </div>
    )
  );
  