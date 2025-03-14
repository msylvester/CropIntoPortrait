// app/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React from 'react';
import VideoClipGenerator from '@/components/VideoClipGenerator';
import VideoPlayer from '@/components/VideoPlayer';
import VidClipOG from '@/components/VidClipOG'
const Page = () => {
  const FLASK_SERVER = 'http://localhost:5001';
  const initialVideoPath = null;

  return (
    <div>
      <VideoPlayer 
        videoPath={initialVideoPath}
        title="Simulating the Human Race"
      />
      <div className="mt-8">
        <VidClipOG />
      </div>
    </div>
  );
};

export default Page;