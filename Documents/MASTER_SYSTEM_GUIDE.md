# 🎯 Civil Service Commission Master System Guide

**Complete Automated Recording & Document Management System**

---

## 🚀 QUICK START

### Step 1: Start the System
**Double-click** `MASTER_MONITOR.command` → Choose "Start Master Monitor"

### Step 2: Use the System  
**Drop any file** in the main Recordings folder - system handles everything automatically!

### Step 3: Get Results
- **Media files** → Auto-transcribed and summarized
- **Document files** → Auto-analyzed and summarized
- **All files** → Auto-organized into proper folders

---

## 📁 SYSTEM ORGANIZATION

```
Recordings/
├── 🎥 Recordings/          # Video/Audio files (.mp4, .mp3, .wav)
├── 📄 Transcripts/         # Document files (.txt, .vtt, .docx) 
├── 📝 Notes/               # AI-generated meeting summaries (formerly Summaries/)
├── ⚖️ Orders_Notice/       # Official orders and notices from hearings
├── 📋 Template/            # Detailed templates for producing Notes and Orders_Notice
├── 🗃️ Logs/               # System processing logs
├── 📚 Documents/           # System guides and reference files
├── MASTER_MONITOR.command # ⚡ Main control system (double-click)
├── claude_summarizer.sh   # Core AI processing engine
└── CHECK_SYSTEM.command   # System verification tool
```

---

## 🤖 SMART AI PROCESSING

### Automatic Meeting Type Detection
The system automatically identifies and applies the correct format:

**🏛️ Commission Meetings** → **Robert's Rules Format**
- Regular meetings, Special meetings
- PMSC, GASC, RGSC committee meetings  
- Structured parliamentary procedure summaries

**⚖️ Case Meetings** → **CSC Legal Format**
- Case hearings (CSC-XX-XXX format)
- Status conferences  
- Legal timelines and action items

### AI-Powered Features
- **Name Correction**: Automatically fixes commissioner/staff names using COMMON_NAMES.md
- **Content Analysis**: Understands meeting context and applies appropriate formatting
- **Action Items**: Extracts tasks, deadlines, and responsible parties
- **Decision Tracking**: Identifies votes, motions, and resolutions

---

## 🎬 MEDIA FILE PROCESSING

### Supported Formats
**Video**: .mp4, .mov, .m4a  
**Audio**: .mp3, .wav

### Automatic Workflow
1. **📁 Auto-Organization** → Moves to Recordings/ subfolder
2. **🎵 Audio Extraction** → Uses FFmpeg to extract audio from video  
3. **📝 AI Transcription** → OpenAI Whisper creates accurate transcript
4. **🧠 Content Analysis** → AI analyzes meeting content and context
5. **📊 Smart Summary** → Generates appropriate format summary
6. **🗃️ Archive** → Saves all files with consistent naming

### Output Files Created
- `filename_transcript.txt` → Full transcript in Transcripts/
- `filename_summary.md` → Meeting summary in Notes/
- `filename.wav` → Extracted audio in Transcripts/
- `filename_analysis.json` → AI analysis metadata in Transcripts/

---

## 📄 DOCUMENT FILE PROCESSING

### Supported Formats  
**Text**: .txt, .vtt (subtitle files)  
**Documents**: .docx

### Automatic Workflow
1. **📁 Auto-Organization** → Moves to Transcripts/ subfolder
2. **📖 Content Reading** → Analyzes document text and format
3. **🔍 Meeting Detection** → Identifies meeting type and participants
4. **📊 Smart Summary** → Creates appropriate summary format
5. **🗃️ Archive** → Organized with consistent naming

### Use Cases
- **Pre-existing transcripts** → Get AI analysis and summaries
- **Meeting minutes** → Convert to standardized format
- **Subtitle files** → Process .vtt files from video platforms

---

## ⚖️ ORDERS & NOTICES HANDLING

### Orders_Notice Folder Rules
**All official orders and notices must be saved in the Orders_Notice/ folder**

**Document Types for Orders_Notice/**
- Status Conference Orders
- Hearing Notices 
- Scheduling Orders
- Continuance Notices
- Final Decisions
- Administrative Orders
- Procedural Notices

### Template Usage Requirements
**Always use Templates/ as detailed guides for document creation**

**Available Templates:**
- `CSC_NOTICE_ORDER_TEMPLATE.md` → For all orders and notices
- `COMMISSION_MEETING_TEMPLATE.md` → For commission meeting summaries  
- `CASE_MEETING_TEMPLATE.md` → For case hearing summaries

### Document Creation Workflow
1. **Select Template** → Choose appropriate template from Templates/ folder
2. **Follow Format** → Use template structure and formatting exactly
3. **Complete Content** → Fill in all required fields and sections
4. **Save Location** → 
   - Orders/Notices → Save to Orders_Notice/ folder
   - Meeting Notes → Save to Notes/ folder
5. **Consistent Naming** → Use case numbers and descriptive names

### Template Compliance Rules
- **Mandatory Usage**: All documents must follow template structure
- **Format Consistency**: Maintain template formatting and sections
- **Field Completion**: Fill all template placeholders completely
- **Legal Requirements**: Templates ensure proper legal formatting
- **Professional Standards**: Templates maintain commission document standards

---

## 👥 NAME CORRECTION SYSTEM

### Automatic Name Recognition
The system uses `COMMON_NAMES.md` to automatically correct:

**Commission Leadership**
- Chairperson Raymond Muna
- Vice Chair Patrick Fitial  
- Secretary Victoria Bellas
- Budget Officer Richard Farrell

**Commission Members**  
- Commissioner Elvira Mesgnon
- Commissioner Michele Joab
- Commissioner Frances Torres

**Administrative Staff**
- Director Joseph Pangelinan (OPM)
- Executive Assistant Teresa Borja
- Hearing Officer Mark Scoggins
- Executive Secretary Kadianne Mangarero

### Common Misspelling Correction
Automatically fixes transcription errors like:
- "Muña" → "Raymond Muna"
- "Vittil" → "Patrick Fitial"
- "Olivia" → "Elvira Mesgnon"

---

## 🔧 SYSTEM REQUIREMENTS & SETUP

### Required Software
- **macOS** (tested on macOS 10.14+)
- **FFmpeg** - For video/audio processing
- **OpenAI Whisper** - For AI transcription  
- **Python 3** - For AI processing

### Quick Installation
```bash
# Install FFmpeg via Homebrew
brew install ffmpeg

# Install OpenAI Whisper
pip install openai-whisper

# Verify installation
ffmpeg -version
whisper --help
```

### System Verification
**Double-click** `CHECK_SYSTEM.command` to verify all components

---

## ⚡ SYSTEM CONTROL

### MASTER_MONITOR.command Menu
**Double-click** the main control file for options:

1. **▶️ Start Master Monitor** - Begin automated monitoring
2. **⏹️ Stop Master Monitor** - Stop system gracefully  
3. **📊 Check Status** - View system status and recent activity
4. **📝 View Recent Logs** - See processing history
5. **❌ Exit** - Close control menu

### Command Line Usage (Optional)
```bash
# Start monitoring
./MASTER_MONITOR.command start

# Check status  
./MASTER_MONITOR.command status

# Stop monitoring
./MASTER_MONITOR.command stop

# View logs
./MASTER_MONITOR.command logs
```

---

## 📊 MONITORING & LOGS

### Log Files Location
- **Master Log**: `Logs/master_monitor.log`
- **Processing History**: `.master_monitor.log`
- **System Status**: View via MASTER_MONITOR.command menu

### What Gets Logged
- File detection and organization
- Processing progress and completion
- Error messages and troubleshooting info  
- System status and performance metrics

### Viewing Activity
- **Real-time**: `tail -f Logs/master_monitor.log`
- **Recent activity**: Use MASTER_MONITOR.command menu
- **Full history**: Open log files in any text editor

---

## 🛠️ TROUBLESHOOTING

### System Won't Start
1. **Check Dependencies**: Run `CHECK_SYSTEM.command`
2. **Install Missing Tools**: Use installation commands above
3. **Restart System**: Stop and start MASTER_MONITOR

### Files Not Processing
1. **Check File Stability**: System waits for files to finish copying
2. **Verify File Format**: Only supported formats are processed
3. **Check Logs**: View recent logs for error messages
4. **Manual Test**: Try processing one file manually

### Processing Errors
1. **File Permissions**: Ensure files are readable/writable
2. **Disk Space**: Verify sufficient space for processing
3. **File Corruption**: Test files in other media players
4. **Network Issues**: Some processing requires internet

### Common Solutions
```bash
# Restart monitoring system
./MASTER_MONITOR.command stop
./MASTER_MONITOR.command start

# Clear processing logs
rm .master_monitor.log

# Check system status
./CHECK_SYSTEM.command
```

---

## 🎯 BEST PRACTICES

### For Maximum Efficiency
- **One System**: Use only MASTER_MONITOR.command (other scripts removed)
- **Drop and Go**: Just drop files in main folder, system handles organization
- **Monitor Logs**: Check status periodically via the command menu
- **Regular Cleanup**: Archive old log files when they get large

### File Organization Tips
- **Descriptive Names**: Use clear, descriptive filenames for meetings
- **Date Format**: Include dates in YYYY-MM-DD format when possible  
- **Consistent Naming**: Follow existing naming patterns in your recordings

### Performance Optimization
- **Stable Files**: Let large files finish copying before processing begins
- **Internet Connection**: Maintain stable connection for AI processing
- **System Resources**: Close unnecessary applications during processing

---

## 📞 SUPPORT & MAINTENANCE

### Self-Service Diagnostics
1. **CHECK_SYSTEM.command** - Verify all components working
2. **MASTER_MONITOR.command** → Status - Check system health
3. **Log Files** - Review for error patterns

### System Updates
- **Core System**: MASTER_MONITOR.command and claude_summarizer.sh
- **Name Database**: Update COMMON_NAMES.md as needed
- **Dependencies**: Keep FFmpeg and Whisper updated

### Advanced Configuration
- **Processing Rules**: Modify claude_summarizer.sh for custom formats
- **Name Recognition**: Add entries to COMMON_NAMES.md
- **File Organization**: Adjust folder structure if needed

---

## ✨ SYSTEM BENEFITS

### Complete Automation
- **Zero Manual Work**: Drop files and get professional results
- **Smart Organization**: Files automatically sorted into correct folders
- **Consistent Quality**: Same high-quality processing every time

### Professional Output  
- **Accurate Transcripts**: AI-powered speech recognition
- **Proper Formatting**: Meeting-specific summary formats
- **Name Correction**: Professional, consistent participant names
- **Action Items**: Clear task identification and tracking

### Time Savings
- **Batch Processing**: Handle multiple files automatically
- **Background Operation**: System works while you do other tasks  
- **Instant Results**: Summaries available immediately after processing

---

**🎯 Ready to Use: Double-click MASTER_MONITOR.command and start dropping files!**

---

*System Version: Master Automated Edition | Last Updated: August 2025*