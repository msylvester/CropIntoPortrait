// app/api/process-video/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Define base paths
const BASE_PATH = '/Users/mikress/web_app_portrait/CropIntoPortrait/js_web_app/my-app/next_web_app/nxt-land-portrait/src/mac_version';
const PYTHON_PATH = '/opt/anaconda3/envs/llm/bin/python';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, quality = "144p" } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('Starting video processing...');

    // Use full paths for all Python scripts
    const command = `cd "${BASE_PATH}" && "${PYTHON_PATH}" "${BASE_PATH}/process_vid_v2.py" "${url}" "${quality}"`;

    console.log('Executing command:', command);

    const { stdout, stderr } = await execPromise(command, {
      env: {
        ...process.env,
        CONDA_PREFIX: '/opt/anaconda3/envs/llm',
        PATH: `/opt/anaconda3/envs/llm/bin:${process.env.PATH}`,
        PYTHONPATH: BASE_PATH  // Add the base path to PYTHONPATH
      }
    });

    if (stderr) {
      console.error('Script stderr:', stderr);
    }

    console.log('Script stdout:', stdout);

    return NextResponse.json({
      success: true,
      output: 'hello',
      message: 'Video processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing video:', error);
    if (error instanceof Error) {
      const processError = error as { message: string; stdout?: string; stderr?: string };
      return NextResponse.json(
        { 
          error: 'Failed to process video', 
          details: processError.message,
          stdout: processError.stdout, 
          stderr: processError.stderr, 
        },
        { status: 500 }
      );
    }
    // Handle non-Error objects
    return NextResponse.json(
      { 
        error: 'Failed to process video', 
        details: 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}