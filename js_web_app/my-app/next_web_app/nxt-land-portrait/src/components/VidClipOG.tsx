'use client'

import React, { useState, useEffect } from 'react';
import { InputSection } from './InputSection';
import VideoPlayer from './VideoPlayer'; // Import correctly with default export
import GeneratedVideosGrid from './GeneratedVideosGrid';


const FLASK_SERVER = 'http://localhost:5001';
const FIXED_UUID = 'msylvest'; // Updated the UUID to match your directory structure

interface GeneratorState {
  isLoading: boolean;
  generatedVideos: string[];
  scriptOutput?: string;
  currentVideo?: string;
  videoExists: boolean;
  currentTaskId?: string;
}

interface TaskResponse {
  task_id: string;
  status: string;
  status_url: string;
  uuid?: string;
}

interface TaskStatusResponse {
  state: string;
  success?: boolean;
  qualities?: string[];
  videos?: string[];
  script_output?: string;
  error?: string;
  uuid?: string;
  video_id?: string;
}

const VideoClipGenerator: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [availableResolutions, setAvailableResolutions] = useState<string[]>([]);
  const [resolution, setResolution] = useState<string>('');
  const [isLoadingResolutions, setIsLoadingResolutions] = useState(false);
  const [resolutionTaskId, setResolutionTaskId] = useState<string | null>(null);
  const [state, setState] = useState<GeneratorState>({
    isLoading: false,
    generatedVideos: [],
    currentVideo: `${FLASK_SERVER}/video/sim.mp4`,
    videoExists: false,
    currentTaskId: undefined
  });

  // Poll for resolution task status
  useEffect(() => {
    if (!resolutionTaskId) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${FLASK_SERVER}/api/task-status/${resolutionTaskId}`);
        if (!response.ok) {
          throw new Error('Failed to get task status');
        }

        const statusData = await response.json() as TaskStatusResponse;
        console.log('Resolution task status:', statusData);

        if (!isMounted) return;

        if (statusData.state === 'SUCCESS') {
          clearInterval(pollInterval);
          setResolutionTaskId(null);
          
          if (statusData.success && statusData.qualities && statusData.qualities.length > 0) {
            setAvailableResolutions(statusData.qualities);
            setResolution(statusData.qualities[0]);
          }
          setIsLoadingResolutions(false);
        } else if (statusData.state === 'FAILURE') {
          clearInterval(pollInterval);
          setResolutionTaskId(null);
          setIsLoadingResolutions(false);
          console.error('Task failed:', statusData.error);
        }
        // For PENDING or other states, continue polling
      } catch (error) {
        console.error('Error polling task status:', error);
        if (isMounted) {
          clearInterval(pollInterval);
          setResolutionTaskId(null);
          setIsLoadingResolutions(false);
        }
      }
    }, 1000); // Poll every second

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [resolutionTaskId]);

  // Poll for video processing task status
  useEffect(() => {
    if (!state.currentTaskId) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${FLASK_SERVER}/api/task-status/${state.currentTaskId}`);
        if (!response.ok) {
          throw new Error('Failed to get task status');
        }

        const statusData = await response.json() as TaskStatusResponse;
        console.log('Process task status:', statusData);

        if (!isMounted) return;

        if (statusData.state === 'SUCCESS') {
          clearInterval(pollInterval);
          
          if (statusData.success && statusData.videos && statusData.videos.length > 0) {
            try {
              // Do a HEAD request to check if the video exists
              const videoCheck = await fetch(statusData.videos[0], { method: 'HEAD' });
              
              if (videoCheck.ok) {
                console.log("Video exists and is accessible!");
              } else {
                console.warn("Video responded with status:", videoCheck.status);
              }
              
              setState(prev => ({
                ...prev,
                isLoading: false,
                currentTaskId: undefined,
                generatedVideos: statusData.videos,
                scriptOutput: statusData.script_output || '',
                currentVideo: videoCheck.ok ? statusData.videos[0] : prev.currentVideo,
                videoExists: videoCheck.ok
              }));
            } catch (error) {
              console.error('Error checking video:', error);
              setState(prev => ({ 
                ...prev, 
                isLoading: false,
                currentTaskId: undefined 
              }));
            }
          } else {
            setState(prev => ({ 
              ...prev, 
              isLoading: false,
              currentTaskId: undefined 
            }));
          }
        } else if (statusData.state === 'FAILURE') {
          clearInterval(pollInterval);
          console.error('Task failed:', statusData.error);
          alert(statusData.error || 'Failed to process video');
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            currentTaskId: undefined 
          }));
        }
        // For PENDING or other states, continue polling
      } catch (error) {
        console.error('Error polling task status:', error);
        if (isMounted) {
          clearInterval(pollInterval);
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            currentTaskId: undefined 
          }));
        }
      }
    }, 1000); // Poll every second

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [state.currentTaskId]);

  useEffect(() => {
    const fetchVideoOptions = async () => {
      if (!url) {
        setAvailableResolutions([]);
        setResolution('');
        return;
      }
      
      setIsLoadingResolutions(true);
      try {
        const response = await fetch(`${FLASK_SERVER}/api/get-video-options`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch video options');
        }

        // The response now contains a task ID instead of the actual data
        const data = await response.json() as TaskResponse;
        console.log('Received task response:', data);
        
        // Store the task ID to poll for its status
        setResolutionTaskId(data.task_id);
        
      } catch (error) {
        console.error('Error fetching video options:', error);
        setIsLoadingResolutions(false);
      }
    };

    fetchVideoOptions();
  }, [url]);

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

  const handleUrlChange = (newUrl: string): void => {
    setUrl(newUrl);
  };

  const handleVideoSelect = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl, { method: 'HEAD' });
      if (response.ok) {
        setState(prev => ({
          ...prev,
          currentVideo: videoUrl,
          videoExists: true
        }));
      } else {
        console.warn(`Video not accessible: ${videoUrl} returned status ${response.status}`);
      }
    } catch (error) {
      console.error('Error checking video:', error);
    }
  };
  
  const handleCancelDownload = async (): Promise<void> => {
    try {
      console.log('Attempting to cancel task:', state.currentTaskId);
      
      if (!state.currentTaskId) {
        console.warn('No active task to cancel');
        return;
      }

      console.log('Sending cancel request for task:', state.currentTaskId);
      
      const response = await fetch(
        `${FLASK_SERVER}/api/cancel-process/${state.currentTaskId}`,
        { method: 'POST' }
      );

      const responseData = await response.json();
      console.log('Cancel response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to cancel processing');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        currentTaskId: undefined
      }));

    } catch (error) {
      console.error('Error cancelling download:', error);
      alert('Failed to cancel the download. Please try again.');
    }
  };
  
  const handleGenerate = async (): Promise<void> => {
    if (!url) {
      alert('Please enter a video URL');
      return;
    }

    if (!resolution) {
      alert('Please select a resolution');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch(`${FLASK_SERVER}/api/process-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          resolution,
          uuid: FIXED_UUID // Include the fixed UUID in every request
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process video');
      }

      // The response now contains a task ID
      const data = await response.json() as TaskResponse;
      console.log('Process task response:', data);
      
      // Store the task ID to poll for status
      setState(prev => ({
        ...prev,
        currentTaskId: data.task_id
      }));

    } catch (error) {
      console.error('Error processing video:', error);
      alert(error instanceof Error ? error.message : 'Failed to process video. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (        
    <div className="bg-black p4">
      <div className="max-w-6xl mx-auto space-y-8">
        <InputSection
          url={url}
          onUrlChange={handleUrlChange}
          isLoadingResolutions={isLoadingResolutions}
          availableResolutions={availableResolutions}
          resolution={resolution}
          onResolutionChange={setResolution}
          onGenerate={handleGenerate}
          onCancelDownload={handleCancelDownload}
          isLoading={state.isLoading}
        />
        {state.currentVideo && <VideoPlayer videoPath={state.currentVideo} />}
        {state.generatedVideos && <GeneratedVideosGrid videos={state.generatedVideos} onVideoSelect={handleVideoSelect}/>} 
      </div>
    </div>
  );
};

export default VideoClipGenerator;
