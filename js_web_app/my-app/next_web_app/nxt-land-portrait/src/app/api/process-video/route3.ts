// app/api/process-video/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const SCRIPT_PATH = '/Users/mikress/web_app_portrait/CropIntoPortrait/js_web_app/my-app/next_web_app/nxt-land-portrait/src/app/api/process-video/';
const PYTHON_PATH = '/opt/anaconda3/envs/llm/bin/python';

export async function POST(req: Request) {
  try {
    console.log('Starting Python script execution...');

    // Construct the command to run the Python script
    const command = `cd "${SCRIPT_PATH}" && "${PYTHON_PATH}" "${SCRIPT_PATH}/add.py"`;
    console.log('Executing command:', command);

    const { stdout, stderr } = await execPromise(command, {
      env: {
        ...process.env,
        CONDA_PREFIX: '/opt/anaconda3/envs/llm',
        PATH: `/opt/anaconda3/envs/llm/bin:${process.env.PATH}`
      }
    });

    if (stderr) {
      console.error('Script stderr:', stderr);
    }

    console.log('Script stdout:', stdout);

    return NextResponse.json({
      success: true,
      output: stdout.trim(),
      message: 'Python script executed successfully'
    });
    
  } catch (error) {
    console.error('Error executing Python script:', error);
    if (error instanceof Error) {
      const processError = error as { message: string; stdout?: string; stderr?: string };
      return NextResponse.json(
        { 
          error: 'Failed to execute Python script', 
          details: processError.message,
          stdout: processError.stdout, 
          stderr: processError.stderr, 
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { 
        error: 'Failed to execute Python script', 
        details: 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}