import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { title, summary, transcript, date } = await request.json();
    
    if (!title || !summary) {
      return NextResponse.json({ error: 'Title and summary are required' }, { status: 400 });
    }

    // Create meeting-summaries directory if it doesn't exist
    const summariesDir = path.join(process.cwd(), 'meeting-summaries');
    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true });
    }

    // Generate safe filename
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date(date).toISOString().split('T')[0];
    
    // Save summary file
    const summaryFilename = `${dateStr}_${safeTitle}_summary.md`;
    const summaryPath = path.join(summariesDir, summaryFilename);
    
    // Ensure summary is a string
    const summaryContent = typeof summary === 'string' ? summary : JSON.stringify(summary, null, 2);
    fs.writeFileSync(summaryPath, summaryContent);

    // Save transcript if provided
    if (transcript) {
      const transcriptFilename = `${dateStr}_${safeTitle}_transcript.txt`;
      const transcriptPath = path.join(summariesDir, transcriptFilename);
      fs.writeFileSync(transcriptPath, transcript);
    }

    return NextResponse.json({ 
      success: true, 
      summaryPath: summaryFilename,
      message: 'Board meeting summary saved successfully'
    });

  } catch (error) {
    console.error('Error saving summary:', error);
    return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 });
  }
}