// components/GeneratedVideosGrid.tsx
import React from 'react';
import { GeneratedVideosGridProps } from './types';

export const GeneratedVideosGrid: React.FC<GeneratedVideosGridProps> = ({
  videos,
  onVideoSelect
}) => (
  videos.length > 0 && (
    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Generated Clips
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((videoUrl, index) => (
          <div 
            key={index} 
            className="space-y-2 cursor-pointer" 
            onClick={() => onVideoSelect(videoUrl)}
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