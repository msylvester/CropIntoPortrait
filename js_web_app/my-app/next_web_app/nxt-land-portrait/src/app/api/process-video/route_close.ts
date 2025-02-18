import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, resolution } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Forward the request to Flask backend
    const flaskResponse = await fetch('http://localhost:5001/api/process-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, resolution }),
    });

    if (!flaskResponse.ok) {
      const errorData = await flaskResponse.json();
      throw new Error(errorData.error || 'Failed to process video');
    }

    const data = await flaskResponse.json();

    return NextResponse.json({
      success: true,
      output: data.output,
      message: 'Videos processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}