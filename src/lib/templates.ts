import { MeetingTemplate } from '@/types';

export const COMMISSION_MEETING_TEMPLATE = `# [MEETING_TYPE] - [MEETING_DATE] 

## Meeting Information
**Date:** [MEETING_DATE]  
**Time:** [START_TIME]  
**Type:** [MEETING_TYPE]  
**Recording:** \`[RECORDING_FILENAME]\`

## Call to Order
Meeting called to order at [START_TIME] by Chairperson Raymond Muna.

## Roll Call & Attendance
- **Chairperson Raymond Muna** - [ATTENDANCE_STATUS]
- **Vice Chair Patrick Fitial** - [ATTENDANCE_STATUS]  
- **Secretary Victoria Bellas** - [ATTENDANCE_STATUS]
- **Budget Officer Richard Farrell** - [ATTENDANCE_STATUS]
- **Commissioner Elvira Mesgnon** - [ATTENDANCE_STATUS]
- **Commissioner Michele Joab** - [ATTENDANCE_STATUS]
- **Commissioner Frances Torres** - [ATTENDANCE_STATUS]

**Quorum Status:** [QUORUM_STATUS] ([X] of 7 members present)

## Approval of Agenda
**Motion:** [MEMBER_NAME] moved to adopt the [MEETING_DATE] [MEETING_TYPE] agenda.  
**Second:** [MEMBER_NAME]  
**Vote:** [VOTE_RESULT] (Aye: [X], Nay: [X])  
**Result:** [MOTION_RESULT]

## New Business

### [BUSINESS_ITEM_1]
**Presenter:** [PRESENTER_NAME]  
**Issue:** [ISSUE_DESCRIPTION]  
**Recommendation:** [RECOMMENDATION_DETAILS]

**Motion:** [MEMBER_NAME] moved to [MOTION_DESCRIPTION]  
**Second:** [MEMBER_NAME]  
**Vote:** [VOTE_RESULT] (Aye: [X], Nay: [X])  
**Result:** [MOTION_RESULT]

## Action Items
- [ACTION_ITEM_1]
- [ACTION_ITEM_2]

## Adjournment
Meeting adjourned at approximately [END_TIME].

**Meeting Duration:** Approximately [DURATION] minutes  
**Minutes Prepared:** [PREPARATION_DATE]  
`;

export const CASE_MEETING_TEMPLATE = `**COMMONWEALTH OF THE NORTHERN MARIANA ISLANDS**  
**CIVIL SERVICE COMMISSION**

---

**In Re Matter of:**

**[APPELLANT_LAST_NAME]**,  
                                    Appellant,

v.                                             **Civil Service Case No.**  
                                              **CSC-[YY]-[XXX]**  

**[DEPARTMENT_NAME]**,  
                                    Appellee.

---

# **CASE MEETING NOTES**
**[STATUS_CONFERENCE/ADJUDICATION_HEARING/SHOW_CAUSE/OTHER]**

**Date:** [MEETING_DATE]  
**Recording:** \`[RECORDING_FILENAME]\`

---

**HEARING OFFICER:** Mark Scoggins  

**APPELLANTS & REPRESENTATIVES PRESENT:**
- [List participants from transcript]

**DEPARTMENT/AGENCY & REPRESENTATIVES PRESENT:**  
- [List participants from transcript]

---

**CASE BACKGROUND:**  
**Employment Action:** [TERMINATION/SUSPENSION/DEMOTION/OTHER]  
**Department:** [DEPARTMENT_NAME]  
**Issue:** [Brief description]

---

**KEY DISCUSSION POINTS**

**I. [ISSUE_TITLE]**
- **Discussion:** [Summary of discussion]
- **Positions:** [Stated positions]
- **Hearing Officer Response:** [Response if given]

---

**ORDERS & DEADLINES**

| **Date** | **Party** | **Action Required** | **Status** |
|----------|-----------|-------------------|------------|
| [DATE] | [PARTY] | [SPECIFIC ACTION] | Pending |

---

**ACTION ITEMS & NEXT STEPS**

| **Action** | **Assigned To** | **Deadline** | **Category** |
|------------|-----------------|--------------|--------------|
| [ACTION] | [PARTY] | [DATE] | Immediate/Short-term/Long-term |

---

**MEETING SUMMARY**
**Key Outcomes:**
[Brief summary of major decisions and next steps]

---

**Notes Prepared:** [PREPARATION_DATE]  
`;

export const CSC_NOTICE_ORDER_TEMPLATE = `**COMMONWEALTH OF THE NORTHERN MARIANA ISLANDS**
**CIVIL SERVICE COMMISSION**

---

**In Re Matter of:**

**[APPELLANT_NAME]**,
                                    Appellant,

v.                                             **Civil Service Case No.**
                                              **CSC-[YY]-[XXX]**

**[DEPARTMENT_NAME]**,
                                    Appellee.

---

## **[ORDER_TYPE]**

**TO:** All Parties and Counsel of Record

**DATE:** [ORDER_DATE]

---

**BACKGROUND**
[Brief case background and current procedural posture]

**ORDER**
The Civil Service Commission hereby ORDERS as follows:

1. [SPECIFIC ORDER 1]

2. [SPECIFIC ORDER 2]

3. [SPECIFIC ORDER 3]

**DEADLINES**
- [DEADLINE 1]: [PARTY] shall [ACTION]
- [DEADLINE 2]: [PARTY] shall [ACTION]

**NOTICE**
Failure to comply with this Order may result in sanctions, including dismissal of claims or defenses.

---

**DATED this [DAY] day of [MONTH], [YEAR].**

**Mark Scoggins**
**Hearing Officer**
**Civil Service Commission**

---

**CERTIFICATE OF SERVICE**
I hereby certify that copies of the foregoing Order were served upon the parties listed below:

**[APPELLANT_NAME]**
[ADDRESS]

**[DEPARTMENT_NAME]**  
[ADDRESS]

**DATED:** [SERVICE_DATE]

**[SIGNATURE]**
[NAME], [TITLE]
`;

export const MEETING_TEMPLATES: MeetingTemplate[] = [
  {
    id: 'commission',
    name: 'Commission Meeting',
    type: 'commission',
    template: COMMISSION_MEETING_TEMPLATE
  },
  {
    id: 'case',
    name: 'Case Hearing',
    type: 'case', 
    template: CASE_MEETING_TEMPLATE
  },
  {
    id: 'notice',
    name: 'Notice/Order',
    type: 'notice',
    template: CSC_NOTICE_ORDER_TEMPLATE
  }
];

export const COMMON_NAMES = {
  'Raymond Muna': ['Muña', 'Raymond', 'Muna', 'Chairman Muna', 'Chair Muna'],
  'Patrick Fitial': ['Vittil', 'Patrick', 'Fitial', 'Vice Chair Fitial'],
  'Victoria Bellas': ['Bellas', 'Victoria', 'Secretary Bellas'],
  'Richard Farrell': ['Farrell', 'Richard', 'Budget Officer Farrell'],
  'Elvira Mesgnon': ['Olivia', 'Elvira', 'Mesgnon', 'Commissioner Mesgnon'],
  'Michele Joab': ['Michele', 'Joab', 'Commissioner Joab'],
  'Frances Torres': ['Frances', 'Torres', 'Commissioner Torres'],
  'Joseph Pangelinan': ['Joseph', 'Pangelinan', 'Director Pangelinan'],
  'Teresa Borja': ['Teresa', 'Borja', 'Executive Assistant Borja'],
  'Mark Scoggins': ['Mark', 'Scoggins', 'Hearing Officer Scoggins'],
  'Kadianne Mangarero': ['Kadianne', 'Mangarero', 'Executive Secretary Mangarero']
};