import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const templatePath = path.join(process.cwd(), 'template', 'COMMISSION_MEETING_TEMPLATE.md');
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: 'Template file not found' }, { status: 404 });
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    
    return new NextResponse(templateContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error reading template file:', error);
    return NextResponse.json({ error: 'Failed to read template' }, { status: 500 });
  }
}