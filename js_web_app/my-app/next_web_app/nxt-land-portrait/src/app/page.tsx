"use client"

import { useState } from 'react';
import { Sparkles } from "lucide-react";

export default function Home() {
  const [text, setText] = useState('');
  const [showVideos, setShowVideos] = useState(false);

  const videos = [
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="w-full max-w-2xl mx-auto space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Text to Clips Generator
          </h1>
          
          <div className="space-y-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full h-40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
            />
            
            <button 
              onClick={() => setShowVideos(true)}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5" />
              Generate Clips
            </button>
          </div>
        </div>

        {showVideos && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((url, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <video
                  controls
                  className="w-full aspect-video"
                  preload="metadata"
                >
                  <source src={url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Clip {index + 1}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}