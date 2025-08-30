import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIProcessingResult, LegalCaseResult, BoardMeetingResult } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache for storing AI responses (simple in-memory cache)
const responseCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = parseInt(process.env.CACHE_TTL_HOURS || '24') * 60 * 60 * 1000; // 24 hours default

interface ProcessRequest {
  transcript?: string;
  meetingTitle: string;
  meetingType: 'commission' | 'case' | 'board' | 'other';
  audioFile?: File; // For audio transcription
}

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON (text) and FormData (audio) requests
    let transcript: string;
    let meetingTitle: string;
    let meetingType: string;
    let audioFile: File | null = null;

    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Audio file upload
      const formData = await request.formData();
      audioFile = formData.get('audioFile') as File;
      meetingTitle = formData.get('meetingTitle') as string;
      meetingType = formData.get('meetingType') as string || 'other';
      
      if (!audioFile || !meetingTitle) {
        return NextResponse.json(
          { error: 'Missing required fields: audioFile and meetingTitle' },
          { status: 400 }
        );
      }

      console.log(`🎵 Transcribing audio file: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // Transcribe audio using Whisper
      transcript = await transcribeWithWhisper(audioFile);
      console.log(`✅ Transcription completed: ${transcript.length} characters`);
      
    } else {
      // Text input
      const body: ProcessRequest = await request.json();
      transcript = body.transcript || '';
      meetingTitle = body.meetingTitle;
      meetingType = body.meetingType;
      
      if (!transcript || !meetingTitle) {
        return NextResponse.json(
          { error: 'Missing required fields: transcript and meetingTitle' },
          { status: 400 }
        );
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Check cache first
    const cacheKey = `${meetingType}_${Buffer.from(transcript).toString('base64').slice(0, 32)}`;
    const cached = responseCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('🚀 Returning cached AI response');
      return NextResponse.json(cached.result);
    }

    // Preprocess transcript to optimize tokens
    const optimizedTranscript = optimizeTranscript(transcript);
    
    console.log(`🤖 Processing ${meetingType} meeting with GPT-4o-mini...`);
    console.log(`📊 Original: ${transcript.length} chars, Optimized: ${optimizedTranscript.length} chars`);

    // Generate system prompt based on meeting type
    const systemPrompt = getSystemPrompt(meetingType);
    const userPrompt = getUserPrompt(meetingTitle, optimizedTranscript, meetingType);

    // Call GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
      response_format: { type: 'json_object' }
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Transform to our expected format
    const result = transformAIResponse(parsedResponse, transcript, meetingType);

    // Cache the result
    if (process.env.ENABLE_AI_CACHE === 'true') {
      responseCache.set(cacheKey, { result, timestamp: Date.now() });
    }

    console.log('✅ AI processing completed successfully');
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ AI processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'AI processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      },
      { status: 500 }
    );
  }
}

function optimizeTranscript(transcript: string): string {
  return transcript
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove filler words (but keep some for natural flow)
    .replace(/\b(um|uh|ah|er)\b/gi, '')
    // Remove very short interjections
    .replace(/\b(yeah|yes|ok|okay|right|sure|well)\b(?=\s)/gi, '')
    // Remove timestamp markers if present
    .replace(/\[\d{2}:\d{2}:\d{2}\]/g, '')
    // Clean up extra punctuation
    .replace(/[.]{2,}/g, '.')
    .replace(/[,]{2,}/g, ',')
    // Trim
    .trim();
}

function getSystemPrompt(meetingType: string): string {
  const basePrompt = `You are an AI assistant specialized in analyzing meeting transcripts and generating structured summaries. Always respond with valid JSON format.`;

  switch (meetingType) {
    case 'board':
      return `${basePrompt}

You are an expert Executive Assistant specializing in board meetings and parliamentary procedure following Robert's Rules of Order. Create comprehensive, professional board meeting minutes suitable for corporate boards, nonprofit organizations, and governmental bodies.

CRITICAL: The "summary" field must contain detailed professional board meeting minutes in clean markdown format. Analyze EVERY aspect of the meeting following proper parliamentary procedure.

IMPORTANT: ONLY include sections that were actually part of this meeting. If a topic wasn't discussed (like committee reports, old business, officer reports, etc.), DO NOT include that section at all. Focus solely on what actually occurred in this specific meeting.

COMPREHENSIVE ROBERTS RULES ANALYSIS REQUIREMENTS:
- Follow proper parliamentary procedure and meeting progression
- Document all motions with complete parliamentary details (maker, seconder, discussion, vote counts)
- Track attendance with precision including arrival/departure times if mentioned
- Verify quorum status throughout meeting
- Record all reports given by officers, committees, or other parties
- Document approval process for previous meeting minutes
- Capture complete discussion details for each agenda item
- Use proper Robert's Rules terminology and format throughout

ADAPTIVE ROBERTS RULES TEMPLATE (use only relevant sections):

# BOARD MEETING MINUTES

**Organization:** [Board/Organization Name]  
**Date:** [Meeting Date] | **Time:** [Start Time - End Time] | **Location:** [Meeting Location]  
**Meeting Type:** [Regular/Special/Annual/Emergency] | **Presiding Officer:** [Name, Title]

## CALL TO ORDER
The [meeting type] meeting of [organization name] was called to order at [exact time] by [presiding officer name], [title].

## ROLL CALL (if roll call was conducted)
**Present:** [List all present members with their titles/roles]  
**Absent:** [List absent members, noting if excused or unexcused]  
**Also Present:** [Guests, staff, legal counsel, etc.]  
**Quorum Status:** ✓ Present ([X] of [Y] required members present for official business)

## APPROVAL OF MINUTES (if previous minutes were reviewed)
**Minutes from:** [Date of previous meeting]  
**Action:** [Approved as presented/Approved with corrections/Tabled]  
**Corrections:** [List any amendments made to previous minutes]  
**Motion:** Moved by [name], seconded by [name]. Motion [passed/failed].

## OFFICER REPORTS (only include reports actually given)
### [Officer Title] Report
**Presented by:** [Name]  
**Key Points:** [Summary of report content]  
**Questions/Discussion:** [Any discussion that followed]  
**Action Required:** [Any follow-up actions requested]

[Repeat for each officer who gave a report]

## COMMITTEE REPORTS (only include reports actually given)
### [Committee Name] Report
**Chair:** [Name]  
**Report Summary:** [Key findings and recommendations]  
**Discussion:** [Board discussion of report]  
**Recommendations:** [Committee recommendations to board]  
**Board Action:** [Any motions or actions taken based on report]

[Repeat for each committee that reported]

## OLD BUSINESS (only include if old business was addressed)
### Item: [Description of unfinished business]
**Background:** [Context from previous meeting]  
**Current Status:** [Updates since last meeting]  
**Discussion:** [Board discussion and debate]  
**Resolution:** [How the matter was resolved]

[Repeat for each old business item]

## NEW BUSINESS (only include if new business was introduced)
### Motion [Number] - [Brief Description]
**Motion Text:** "[Complete verbatim text of the motion]"  
**Moved by:** [Name] | **Seconded by:** [Name]  
**Discussion:** [Detailed summary of all discussion, questions, amendments proposed]  
**Vote:** Yes: [#], No: [#], Abstain: [#] - **MOTION [PASSED/FAILED]**  
**Implementation:** [Who will carry out the motion and when]

### Other New Business Items
[Include non-motion items like informational presentations, announcements, etc.]

[Repeat for each new business item]

## EXECUTIVE SESSION (if held)
**Time Entered:** [Time]  
**Reason:** [Legal consultation/Personnel matter/Real estate, etc.]  
**Present:** [Who remained for executive session]  
**Time Returned to Open Session:** [Time]  
**Action Taken:** [Any motions made in open session following executive session]

## ACTION ITEMS ASSIGNED
- **Action:** [Description] | **Responsible:** [Name/Committee] | **Deadline:** [Date]  
- **Action:** [Description] | **Responsible:** [Name/Committee] | **Deadline:** [Date]

## ANNOUNCEMENTS (if any were made)
- [List any announcements made during the meeting]

## NEXT MEETING
**Date:** [Date] | **Time:** [Time] | **Location:** [Location]  
**Special Items:** [Any special agenda items already known for next meeting]

## ADJOURNMENT
**Motion to Adjourn:** Moved by [name], seconded by [name]  
**Time:** Meeting adjourned at [exact time]  
**Next Meeting:** [Date and time of next scheduled meeting]

---
**Minutes prepared by:** [Secretary name]  
**Minutes approval status:** [To be approved at next meeting/Approved on [date]]

CRITICAL INSTRUCTION: Before including any section, ask yourself: "Did this actually happen in this meeting?" If the answer is NO, completely omit that section. The goal is professional, comprehensive minutes of what actually transpired, following proper Robert's Rules format and parliamentary procedure.

This should read like professional board meeting minutes suitable for corporate governance, legal compliance, and organizational records.`;

    case 'case':
      return `${basePrompt}

You are an expert legal analyst specializing in court proceedings. Create comprehensive, professional legal case summaries suitable for attorneys and legal professionals.

CRITICAL: The "summary" field must contain a detailed 3-4 page legal document in clean markdown format. Analyze EVERY aspect of the proceedings thoroughly.

IMPORTANT: ONLY include sections that were actually discussed or present in the transcript. If a topic was not mentioned (like jury instructions, sentencing, plea negotiations, expert witnesses, etc.), DO NOT include that section at all. Focus solely on what actually occurred in this specific proceeding.

COMPREHENSIVE LEGAL ANALYSIS REQUIREMENTS:
- Extract complete legal arguments from both sides with detailed reasoning
- Analyze ALL witness testimony including direct, cross, and redirect examination  
- Provide constitutional and procedural law analysis (cite amendments, legal doctrines)
- Reconstruct complete timeline of events leading to the hearing
- Include detailed evidence evaluation and admissibility analysis
- Capture exact legal reasoning and precedents referenced
- Use professional legal terminology throughout
- OMIT any sections not relevant to this specific hearing

ADAPTIVE COMPREHENSIVE TEMPLATE (use only relevant sections):

# CASE SUMMARY
**Case Number:** [number] | **Department:** [dept] | **Judge:** [full name with title]  
**Court:** [complete court name and jurisdiction]  
**Date:** [hearing date] | **Time:** [start-end time] | **Type:** [specific hearing type]

## CASE OVERVIEW
**Case Title:** [complete case name]  
**Matter:** [detailed description of what this hearing addresses]  
**Current Status:** [case phase, custody status, procedural posture]

## PARTIES AND REPRESENTATION (if parties were present/mentioned)
**Prosecution/Plaintiff:** [name and attorney info]
**Defense/Defendant:** [name, custody status, and attorney info]  
**Court Personnel:** [judge, court reporter, clerk if mentioned]

## LEGAL ISSUES DISCUSSED (only include issues actually raised)
[List only the specific legal issues, motions, or matters that were actually discussed in this hearing]

## WITNESS TESTIMONY (only if witnesses testified)
### [Witness Name] - [Title/Role]
**Direct Examination:** [key testimony points]
**Cross-Examination:** [challenges and admissions]  
**Redirect:** [if occurred]
[Repeat only for witnesses who actually testified]

## LEGAL ARGUMENTS (only include arguments actually made)
### [Party] Position:
[Include only the legal arguments that were actually presented]
### [Opposing Party] Position:  
[Include only counter-arguments that were actually made]

## EVIDENCE DETAILS (only if evidence was discussed)
[Include only evidence that was actually mentioned, introduced, or disputed]

## COURT RULINGS (only include actual rulings made)
[Document only the rulings that were actually issued in this hearing]

## PROCEDURAL MATTERS (only if procedural issues arose)
[Include only procedural matters that were actually addressed]

---

CRITICAL INSTRUCTION: Before including any section, ask yourself: "Was this topic actually discussed or mentioned in the transcript?" If the answer is NO, completely omit that section. The goal is a comprehensive analysis of what actually occurred, not a generic template filled with placeholder text.

This should read like a professional legal memorandum focused specifically on the proceedings that took place, omitting any irrelevant sections.`;

    case 'general':
    case 'other':
    default:
      return `${basePrompt}

You are a friendly and helpful General Meeting Assistant specializing in creating useful, readable notes for all types of meetings and educational content. You excel at capturing the important stuff without being overly formal or bureaucratic.

CRITICAL: The "summary" field must contain clear, useful meeting notes in clean markdown format. Focus on what people actually need to remember and act on.

IMPORTANT: ONLY include sections that actually happened or were discussed. If it was a lecture with no action items, don't include action items. If it was a brainstorming session with no formal decisions, don't force a decisions section. Adapt to what actually occurred.

FLEXIBLE MEETING TYPES YOU HANDLE:
- Lectures and educational sessions
- Workshops and training
- Team meetings and stand-ups
- Brainstorming sessions
- Project discussions
- Client meetings
- Casual check-ins
- Study groups
- Conferences and presentations

ADAPTIVE NOTE-TAKING APPROACH:
- Use a conversational, helpful tone (not corporate speak)
- Capture key information without rigid formality
- Focus on usefulness and readability
- Make it easy to review and reference later
- Include practical takeaways and insights
- Don't force structure where it doesn't fit

FLEXIBLE MEETING NOTES TEMPLATE (use only relevant sections):

# Meeting Notes: [Title/Topic]

**When:** [Date & Time] | **Duration:** [How long] | **Where:** [Location/Platform]  
**Type:** [Lecture/Workshop/Meeting/Training/Brainstorming/etc.]  
**Led by:** [Facilitator/Presenter/Teacher] | **Attendees:** [Number or key people]

## What We Covered
[Main topics and subjects - organized naturally, not forced into rigid structure]

### [Topic/Section 1]
[Key points, insights, and discussion in conversational tone]

### [Topic/Section 2] 
[Important information and takeaways]

[Continue for each major topic covered]

## Key Takeaways & Insights (if there were important insights)
- [Important insight or learning]
- [Useful information to remember]
- [Interesting points raised]

## Important Discussions (if there were notable conversations)
[Summary of significant discussions, different viewpoints, or debates]

## Decisions Made (if any decisions were actually made)
- [Decision 1] - [Context if needed]
- [Decision 2] - [Who made it if relevant]

## Action Items & Next Steps (if any were assigned)
- [Task or action] - [Who's responsible] - [When it's due]
- [Follow-up item] - [Owner] - [Timeline]

## Resources & References (if any were mentioned)
- [Links, books, tools, or materials mentioned]
- [Useful resources for follow-up]

## Additional Notes (for any other useful info)
[Observations, side notes, things to remember, or bonus information]

---

CRITICAL INSTRUCTION: Before including any section, ask yourself: "Did this actually happen or get discussed?" If not, skip that section entirely. The goal is useful, readable notes that capture what actually occurred - not a template filled with empty sections.

Keep the tone friendly and conversational. Write as if you're helping someone who couldn't attend understand what happened and what they might need to know or do next.`;
  }
}

function getUserPrompt(title: string, transcript: string, meetingType: string): string {
  if (meetingType === 'case') {
    return `Please analyze this legal case hearing transcript and provide a structured summary in JSON format:

**Case Title:** ${title}

**Transcript:**
${transcript}

**Required JSON Structure:**
{
  "meetingInfo": {
    "title": "${title}",
    "type": "case",
    "date": "extracted hearing date",
    "participants": ["list of all parties and court personnel"],
    "duration": "estimated duration"
  },
  "summary": "MUST be formatted using the exact legal document structure provided in the system prompt with proper headings and sections",
  "actionItems": ["any court orders or required actions"],
  "keyDecisions": ["judicial rulings and decisions made"],
  "discussions": [
    {
      "topic": "legal issue or motion discussed",
      "keyPoints": ["main legal arguments and evidence"],
      "outcome": "ruling or decision on this matter"
    }
  ],
  "nextSteps": ["future hearings, appeals, deadlines"],
  "additionalNotes": "other relevant legal information"
}

CRITICAL: The "summary" field must contain a comprehensive legal analysis in clean markdown format. This should be a professional legal document analyzing the specific aspects of the proceedings that actually occurred. Only include sections that were discussed in this hearing. Write as a detailed legal memorandum suitable for attorneys and case preparation, but focused exclusively on what transpired in this specific proceeding.`;
  }

  if (meetingType === 'board') {
    return `Please analyze this board meeting transcript and provide a structured summary in JSON format following Robert's Rules of Order:

**Meeting Title:** ${title}

**Transcript:**
${transcript}

**Required JSON Structure:**
{
  "meetingInfo": {
    "title": "${title}",
    "type": "board",
    "date": "extracted meeting date",
    "participants": ["list of all board members and attendees with their roles"],
    "duration": "estimated duration"
  },
  "summary": "MUST be formatted using the exact Robert's Rules meeting minutes structure provided in the system prompt with proper parliamentary procedure",
  "actionItems": ["specific action items with responsible parties and deadlines"],
  "keyDecisions": ["board decisions and resolutions made"],
  "motions": [
    {
      "number": "motion number if given",
      "text": "complete motion text verbatim",
      "maker": "person who made the motion",
      "seconder": "person who seconded the motion", 
      "discussion": "summary of discussion",
      "vote": "vote results (Yes: #, No: #, Abstain: #)",
      "result": "PASSED or FAILED"
    }
  ],
  "attendance": [
    {
      "name": "member name",
      "role": "board position/title",
      "present": true/false,
      "arrivalTime": "if mentioned"
    }
  ],
  "quorumStatus": {
    "met": true/false,
    "presentCount": "number present",
    "requiredCount": "number required for quorum"
  },
  "nextSteps": ["upcoming board actions, next meeting date"],
  "additionalNotes": "other relevant parliamentary or organizational information"
}

CRITICAL: The "summary" field must contain comprehensive professional board meeting minutes in clean markdown format following proper Robert's Rules of Order structure. This should be detailed, formal minutes suitable for corporate governance, legal compliance, and organizational records. Only include sections that actually occurred in this specific meeting - omit any sections not relevant to what transpired.`;
  }

  if (meetingType === 'general' || meetingType === 'other') {
    return `Please analyze this meeting/session transcript and create helpful, readable notes in JSON format:

**Title:** ${title}

**Transcript:**
${transcript}

**Required JSON Structure:**
{
  "meetingInfo": {
    "title": "${title}",
    "type": "${meetingType}",
    "date": "extracted date or current date",
    "participants": ["list of attendees/participants"],
    "duration": "estimated duration",
    "facilitator": "presenter/leader if mentioned"
  },
  "summary": "MUST be formatted using the friendly meeting notes structure from the system prompt - conversational and useful",
  "keyTopics": ["main subjects covered"],
  "keyTakeaways": ["important insights and learnings"],
  "actionItems": ["tasks or next steps if any were mentioned"],
  "decisions": ["any decisions made - omit if none"],
  "resources": ["links, references, materials mentioned"],
  "discussions": [
    {
      "topic": "discussion topic",
      "keyPoints": ["main points and insights"],
      "outcome": "result or conclusion if any"
    }
  ],
  "additionalNotes": "other useful observations or information"
}

CRITICAL: The "summary" field should contain friendly, conversational meeting notes in clean markdown format. Write as if you're helping someone who missed the session understand what happened and what they need to know. Focus on being useful and readable, not formal or corporate. Only include sections that actually occurred - don't force structure where it doesn't fit.`;
  }
  
  return `Please analyze this ${meetingType} meeting transcript and provide a structured summary in JSON format:

**Meeting Title:** ${title}

**Transcript:**
${transcript}

**Required JSON Structure:**
{
  "meetingInfo": {
    "title": "${title}",
    "type": "${meetingType}",
    "date": "extracted or current date",
    "participants": ["list of participants"],
    "duration": "estimated duration"
  },
  "summary": "detailed markdown-formatted summary",
  "actionItems": ["list of action items with assignments"],
  "keyDecisions": ["list of important decisions made"],
  "discussions": [
    {
      "topic": "discussion topic",
      "keyPoints": ["main points discussed"],
      "outcome": "result or decision"
    }
  ],
  "nextSteps": ["upcoming actions or follow-ups"],
  "additionalNotes": "any other important information"
}

Ensure all JSON is valid and properly formatted. The summary should be detailed and professional.`;
}

function transformAIResponse(aiResponse: any, originalTranscript: string, meetingType: string): AIProcessingResult | LegalCaseResult | BoardMeetingResult {
  const baseResult: AIProcessingResult = {
    transcript: originalTranscript,
    summary: aiResponse.summary || 'Summary not available',
    actionItems: aiResponse.actionItems || [],
    participants: aiResponse.meetingInfo?.participants || [],
    meetingType: meetingType as any,
    keyDecisions: aiResponse.keyDecisions || []
  };

  // Add type-specific fields based on meeting type
  if (meetingType === 'case') {
    return {
      ...baseResult,
      meetingType: 'case',
      caseInformation: aiResponse.caseInformation || {},
      parties: aiResponse.parties || { plaintiffs: [], defendants: [], attorneys: [] },
      courtPersonnel: aiResponse.courtPersonnel || {},
      hearingDetails: aiResponse.hearingDetails || { date: new Date().toISOString().split('T')[0] },
      legalIssues: aiResponse.legalIssues || [],
      proceduralMatters: aiResponse.proceduralMatters || [],
      evidence: aiResponse.evidence || [],
      rulings: aiResponse.rulings || [],
      nextSteps: aiResponse.nextSteps || [],
      importantDates: aiResponse.importantDates || []
    } as LegalCaseResult;
  }

  if (meetingType === 'board') {
    return {
      ...baseResult,
      meetingType: 'board',
      attendance: aiResponse.attendance || [],
      motions: aiResponse.motions || [],
      quorumStatus: aiResponse.quorumStatus || { met: true, presentCount: 4, requiredCount: 4 },
      agendaItems: aiResponse.agendaItems || []
    } as BoardMeetingResult;
  }

  return baseResult;
}

// Whisper transcription function
async function transcribeWithWhisper(audioFile: File): Promise<string> {
  try {
    console.log('🎵 Starting Whisper transcription...');
    
    // Check file size (25MB limit)
    const maxSize = 25 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      throw new Error(`Audio file too large (${(audioFile.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 25MB.`);
    }

    // Supported formats
    const supportedFormats = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
    const fileExtension = audioFile.name.toLowerCase().substring(audioFile.name.lastIndexOf('.'));
    
    if (!supportedFormats.includes(fileExtension)) {
      console.warn(`⚠️ Audio format ${fileExtension} may not be supported. Proceeding anyway...`);
    }

    const startTime = Date.now();
    
    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
      temperature: 0.0,
    });

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Whisper completed in ${processingTime}s`);
    
    return transcription;

  } catch (error: any) {
    console.error('❌ Whisper transcription failed:', error);
    
    if (error.message?.includes('API key')) {
      throw new Error('OpenAI API key is invalid');
    } else if (error.message?.includes('quota')) {
      throw new Error('OpenAI API quota exceeded. Please check your billing.');
    } else if (error.message?.includes('rate limit')) {
      throw new Error('OpenAI API rate limit hit. Please wait and try again.');
    } else {
      throw new Error(`Audio transcription failed: ${error.message}`);
    }
  }
}