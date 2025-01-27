import React, { useState, useRef, useEffect } from 'react';

const VideoCropper = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [cropPosition, setCropPosition] = useState(50);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(URL.createObjectURL(file));
      setIsVideoLoaded(false);
    }
  };

  const handleCropChange = (event) => {
    setCropPosition(Number(event.target.value));
  };

  const drawPreview = () => {
    if (!videoRef.current || !canvasRef.current || !isVideoLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate crop dimensions
    const videoHeight = video.videoHeight;
    const cropHeight = (videoHeight * 9) / 16; // Height needed for 16:9
    const cropY = (videoHeight - cropHeight) * (cropPosition / 100);

    // Draw cropped video frame
    ctx.drawImage(
      video,
      0, cropY, video.videoWidth, cropHeight,
      0, 0, canvas.width, canvas.height
    );
  };

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    if (videoRef.current && canvasRef.current) {
      // Set canvas dimensions based on 16:9 aspect ratio
      canvasRef.current.width = 640;
      canvasRef.current.height = 360;
      drawPreview();
    }
  };

  const exportFrame = () => {
    if (!canvasRef.current || !isVideoLoaded) return;

    // Create high-res canvas for export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext('2d');

    // Calculate crop dimensions
    const video = videoRef.current;
    const videoHeight = video.videoHeight;
    const cropHeight = (videoHeight * 9) / 16;
    const cropY = (videoHeight - cropHeight) * (cropPosition / 100);

    // Draw cropped frame at higher resolution
    ctx.drawImage(
      video,
      0, cropY, video.videoWidth, cropHeight,
      0, 0, exportCanvas.width, exportCanvas.height
    );

    // Create download link
    const link = document.createElement('a');
    link.download = 'cropped-frame.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    if (isVideoLoaded) {
      drawPreview();
    }
  }, [cropPosition, isVideoLoaded]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Video Cropper</h2>
      
      <div className="space-y-6">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="w-full p-2 border rounded"
        />
        
        {videoFile && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Original Video</h3>
                <video
                  ref={videoRef}
                  src={videoFile}
                  className="w-full border rounded bg-black"
                  controls
                  onLoadedData={handleVideoLoad}
                  onTimeUpdate={drawPreview}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Preview (16:9)</h3>
                <canvas
                  ref={canvasRef}
                  className="w-full border rounded bg-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Vertical Position: {cropPosition}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={cropPosition}
                onChange={handleCropChange}
                className="w-full"
              />
            </div>

            <button
              onClick={exportFrame}
              disabled={!isVideoLoaded}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Frame
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCropper;