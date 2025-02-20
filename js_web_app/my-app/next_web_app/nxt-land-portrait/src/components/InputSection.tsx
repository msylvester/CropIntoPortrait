
  
  // components/InputSection.tsx
  import React from 'react';
  import { InputSectionProps } from './types';
  import { LoadingSpinner } from './LoadingSpinner';
  
  export const InputSection: React.FC<InputSectionProps> = ({
    url,
    onUrlChange,
    isLoadingResolutions,
    availableResolutions,
    resolution,
    onResolutionChange,
    onGenerate,
    isLoading,
  }) => (
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
            onChange={onUrlChange}
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
              onChange={(e) => onResolutionChange(e.target.value)}
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
            onClick={onGenerate}
            disabled={isLoading}
            className={`
              w-full py-3 px-6 rounded-lg font-medium text-white
              transition-all duration-200
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 hover:shadow-lg'
              }
            `}
          >
            {isLoading ? (
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