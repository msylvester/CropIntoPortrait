import React, { useState } from 'react';

const VideoOptionsDisplay = () => {
  const [url, setUrl] = useState('');
  const [qualities, setQualities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVideoOptions = async () => {
    if (!url) {
      setError('Please enter a video URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/get-video-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video options');
      }

      if (data.success && data.qualities) {
        setQualities(data.qualities);
      } else {
        setError('No quality options found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <div className="flex gap-4">
            <input
              id="videoUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter video URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={fetchVideoOptions}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Loading...' : 'Get Options'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {qualities.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Resolutions</h3>
            <div className="grid gap-3">
              {qualities.map((quality, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-md border border-gray-200"
                >
                  {quality}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoOptionsDisplay;