// COMPREHENSIVE DETAILED ANALYSIS IMPLEMENTATION METHODS
// These methods provide exhaustive analysis for the Roberts Rules Agent

export class DetailedAnalysisMethods {
  
  // Identify all meeting segments with detailed context
  static identifyMeetingSegments(transcript: string): Array<{type: string, startIndex: number, content: string, duration: string}> {
    const segments = [];
    const segmentPatterns = [
      { type: 'call_to_order', pattern: /(call|calling|bring|bringing)\s+(to\s+)?order/i },
      { type: 'roll_call', pattern: /roll\s+call|attendance|present|absent/i },
      { type: 'agenda_approval', pattern: /(approve|adopt)\s+(the\s+)?agenda/i },
      { type: 'old_business', pattern: /old\s+business|previous\s+business|unfinished\s+business/i },
      { type: 'new_business', pattern: /new\s+business/i },
      { type: 'motion', pattern: /(motion|move)\s+to|so\s+move/i },
      { type: 'discussion', pattern: /discussion|present|report|explain/i },
      { type: 'vote', pattern: /vote|all\s+in\s+favor|aye|nay|unanimous/i },
      { type: 'adjournment', pattern: /adjourn|conclude|close\s+the\s+meeting/i }
    ];

    segmentPatterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags + 'g');
      while ((match = regex.exec(transcript)) !== null) {
        const startIndex = match.index;
        const endIndex = Math.min(startIndex + 500, transcript.length);
        const content = transcript.substring(startIndex, endIndex);
        
        segments.push({
          type: pattern.type,
          startIndex,
          content: content.trim(),
          duration: Math.round(content.split(/\s+/).length / 150) + ' minutes'
        });
      }
    });

    return segments.sort((a, b) => a.startIndex - b.startIndex);
  }

  // Comprehensive call to order analysis
  static analyzeCallToOrder(transcript: string): {found: boolean, time: string, text: string, chairperson: string} {
    const callPatterns = [
      /(meeting|session)\s+(called|brought)\s+to\s+order/i,
      /(call|calling)\s+(the\s+)?(meeting|session)\s+to\s+order/i,
      /order.*meeting.*to.*order/i
    ];

    for (const pattern of callPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(transcript.length, match.index + 200);
        const context = transcript.substring(contextStart, contextEnd);
        
        // Extract time and chairperson
        const timeMatch = context.match(/(\d{1,2}:\d{2})/);
        const chairMatch = context.match(/(Chairperson|Chairman|Chair)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i) ||
                          context.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d{1,2}:\d{2})/);
        
        return {
          found: true,
          time: timeMatch ? timeMatch[1] : 'Not recorded',
          text: match[0],
          chairperson: chairMatch ? (chairMatch[2] || chairMatch[1]) : 'Chairperson'
        };
      }
    }

    return { found: false, time: '', text: '', chairperson: '' };
  }

  // Comprehensive attendance analysis
  static analyzeComprehensiveAttendance(transcript: string, detectedSpeakers: any[]): Array<{name: string, title: string, present: boolean, firstSpeechTime?: string}> {
    const commissionMembers = [
      { name: 'Raymond Muna', title: 'Chairperson' },
      { name: 'Patrick Fitial', title: 'Vice Chair' },
      { name: 'Victoria Bellas', title: 'Secretary' },
      { name: 'Richard Farrell', title: 'Budget Officer' },
      { name: 'Elvira Mesgnon', title: 'Commissioner' },
      { name: 'Michele Joab', title: 'Commissioner' },
      { name: 'Frances Torres', title: 'Commissioner' }
    ];

    return commissionMembers.map(member => {
      const nameVariations = [
        member.name,
        member.name.split(' ')[0], // First name
        member.name.split(' ')[1], // Last name
        `${member.title} ${member.name}`,
        `${member.title} ${member.name.split(' ')[1]}`
      ];

      // Check if present by looking for name mentions or speaking instances
      const present = nameVariations.some(variation => 
        transcript.toLowerCase().includes(variation.toLowerCase())
      );

      // Find first speech time if present
      let firstSpeechTime;
      if (present) {
        const speaker = detectedSpeakers.find(s => 
          nameVariations.some(v => s.name.toLowerCase().includes(v.toLowerCase()))
        );
        if (speaker && speaker.timeline && speaker.timeline.length > 0) {
          firstSpeechTime = speaker.timeline[0].timestamp;
        }
      }

      return {
        name: `${member.title} ${member.name}`,
        title: member.title,
        present,
        firstSpeechTime
      };
    });
  }

  // Detailed agenda approval analysis
  static analyzeAgendaApproval(transcript: string): {motionMade: boolean, maker: string, seconder: string, result: string, fullText: string} {
    const agendaPatterns = [
      /(motion|move)\s+to\s+(approve|adopt)\s+(the\s+)?agenda/i,
      /(approve|adopt)\s+(the\s+)?agenda/i,
      /agenda.*motion/i
    ];

    for (const pattern of agendaPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        const contextStart = Math.max(0, match.index - 200);
        const contextEnd = Math.min(transcript.length, match.index + 400);
        const context = transcript.substring(contextStart, contextEnd);
        
        // Extract motion maker and seconder
        const makerMatch = context.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(moved|motion)/i);
        const seconderMatch = context.match(/second(ed)?\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i) ||
                             context.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+second/i);
        
        // Determine result
        const resultMatch = context.match(/(carried|passed|approved|unanimous|failed)/i);
        
        return {
          motionMade: true,
          maker: makerMatch ? makerMatch[1] : 'Member',
          seconder: seconderMatch ? (seconderMatch[2] || seconderMatch[1]) : 'Member',
          result: resultMatch ? resultMatch[1] : 'Approved',
          fullText: context.trim()
        };
      }
    }

    return {
      motionMade: false,
      maker: '',
      seconder: '',
      result: 'Not recorded',
      fullText: ''
    };
  }

  // Comprehensive motion analysis with full details
  static analyzeAllMotionsDetailed(transcript: string): Array<{
    id: number;
    type: string;
    maker: string;
    seconder: string;
    fullText: string;
    discussion: string;
    voteType: string;
    result: string;
    timestamp: string;
  }> {
    const motions = [];
    let motionId = 1;

    const motionPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(moved|motion)\s+to\s+([^.!?]+)/gi,
      /(motion|move)\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+to\s+([^.!?]+)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+so\s+move/gi
    ];

    motionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(transcript)) !== null) {
        const motionStart = match.index;
        const motionEnd = Math.min(transcript.length, motionStart + 800);
        const motionContext = transcript.substring(motionStart, motionEnd);

        // Extract details
        const maker = match[1] || match[2] || 'Member';
        const motionText = match[3] || match[0];
        
        // Find seconder
        const seconderMatch = motionContext.match(/second(ed)?\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i) ||
                             motionContext.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+second/i);
        const seconder = seconderMatch ? (seconderMatch[2] || seconderMatch[1]) : 'Member';

        // Find discussion
        const discussionMatch = motionContext.match(/discussion[^.!?]*[.!?]([^.!?]*[.!?]){0,3}/i);
        const discussion = discussionMatch ? discussionMatch[0] : 'Limited discussion recorded';

        // Find vote type and result
        const voteMatch = motionContext.match(/(unanimous|roll\s+call|voice\s+vote|aye.*nay)/i);
        const voteType = voteMatch ? voteMatch[1] : 'Voice vote';
        
        const resultMatch = motionContext.match(/(carried|passed|failed|approved|denied)/i);
        const result = resultMatch ? `Motion ${resultMatch[1]}` : 'Motion carried';

        // Find timestamp
        const timeMatch = motionContext.match(/(\d{1,2}:\d{2})/);
        const timestamp = timeMatch ? timeMatch[1] : 'Not recorded';

        // Determine motion type
        let motionType = 'Main Motion';
        if (motionText.toLowerCase().includes('agenda')) motionType = 'Agenda Approval';
        if (motionText.toLowerCase().includes('approve')) motionType = 'Approval Motion';
        if (motionText.toLowerCase().includes('table')) motionType = 'Table Motion';
        if (motionText.toLowerCase().includes('adjourn')) motionType = 'Adjournment Motion';

        motions.push({
          id: motionId++,
          type: motionType,
          maker,
          seconder,
          fullText: motionText,
          discussion,
          voteType,
          result,
          timestamp
        });
      }
    });

    return motions;
  }

  // Detailed voting records analysis
  static analyzeVotingRecords(transcript: string, motions: any[]): Array<{motionId: number, voteType: string, result: string, details: string}> {
    const votingRecords = [];

    motions.forEach(motion => {
      const voteContext = transcript.substring(
        Math.max(0, transcript.indexOf(motion.fullText) + motion.fullText.length),
        Math.min(transcript.length, transcript.indexOf(motion.fullText) + motion.fullText.length + 500)
      );

      let voteDetails = '';
      
      // Look for specific vote counts
      const voteCountMatch = voteContext.match(/aye[:\s]*(\d+)[,\s]*nay[:\s]*(\d+)/i);
      if (voteCountMatch) {
        voteDetails = `Aye: ${voteCountMatch[1]}, Nay: ${voteCountMatch[2]}`;
      } else if (voteContext.toLowerCase().includes('unanimous')) {
        voteDetails = 'Unanimous consent';
      } else if (voteContext.toLowerCase().includes('all in favor')) {
        voteDetails = 'All members in favor';
      } else {
        voteDetails = 'Voice vote - no opposition noted';
      }

      votingRecords.push({
        motionId: motion.id,
        voteType: motion.voteType,
        result: motion.result,
        details: voteDetails
      });
    });

    return votingRecords;
  }

  // Comprehensive adjournment analysis
  static analyzeAdjournment(transcript: string): {time: string, method: string, text: string} {
    const adjournPatterns = [
      /(meeting\s+)?(adjourned?|concluded?)/i,
      /(motion\s+to\s+)?adjourn/i,
      /close\s+the\s+meeting/i
    ];

    for (const pattern of adjournPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(transcript.length, match.index + 300);
        const context = transcript.substring(contextStart, contextEnd);
        
        // Extract time
        const timeMatch = context.match(/(\d{1,2}:\d{2})/);
        const time = timeMatch ? timeMatch[1] : 'Not recorded';
        
        // Determine method
        let method = 'Motion to adjourn';
        if (context.toLowerCase().includes('no further business')) {
          method = 'No further business';
        } else if (context.toLowerCase().includes('consensus')) {
          method = 'General consensus';
        }

        return {
          time,
          method,
          text: context.trim()
        };
      }
    }

    return { time: 'Not recorded', method: 'Not specified', text: '' };
  }
}