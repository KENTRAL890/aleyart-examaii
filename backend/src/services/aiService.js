// aiService.js — AI-powered exam generation using Anthropic Claude API
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SPECIAL_RULES = {
  Computing:              { section: 'B', q1Rule: 'The first question MUST be a practical computing question (hands-on task).' },
  Science:                { section: 'B', q1Rule: 'The first question MUST be a practical science experiment question.' },
  'Career Technology':    { section: 'B', q1Rule: 'The first question MUST be a practical career technology task.' },
  'Creative Arts and Design': { section: 'B', q1Rule: 'The first question MUST be a practical creative arts task.' },
  RME: { section: 'B', q1Rule: 'The first question MUST be story-based, case-study-based, or scenario-based. At least 70% must use stories, moral scenarios, or real-life situations. Include: "Answer Question 1 and any other required questions."' },
};

const ENGLISH_STRUCTURE_789 = `
English Language JHS structure:
- Section A: Grammar + Objective (40 marks)
- Section B: Grammar (15 marks)  
- Section C: Comprehension on "The Beacon of Light" (15 marks)
- Section D: Summary (10 marks), Composition (10 marks), Literature (10 marks)
Total: 100 marks`;

/**
 * Generate complete examination questions + marking scheme
 */
async function generateExamination(config) {
  const {
    cls, subject, examType, term, academicYear, topics,
    difficulty, duration, totalMarks, numMCQ, numSubjective,
    teacherName, hasSectionC, hasSectionD
  } = config;

  const specialRule = SPECIAL_RULES[subject] || null;
  const isJHS = ['Basic 7','Basic 8','Basic 9'].includes(cls);
  const isEnglishJHS = subject === 'English Language' && isJHS;

  const systemPrompt = `You are a professional Ghanaian examination setter for ALEYART ACADEMY.
You strictly follow:
- Ghana Education Service (GES) standards
- National Council for Curriculum and Assessment (NaCCA)  
- Standards-Based Curriculum (SBC)
- Common Core Programme (CCP)

School: ALEYART ACADEMY | Motto: SEEKING WISDOM
All questions must be age-appropriate, curriculum-aligned, and educationally sound.
You ALWAYS provide EXACT correct answers — never "model answers" or "suggested answers".`;

  const userPrompt = `Generate a complete examination for ALEYART ACADEMY.

PARAMETERS:
- Class: ${cls}
- Subject: ${subject}
- Examination Type: ${examType}
- Academic Year: ${academicYear} | Term: ${term}
- Topics/Subtopics: ${topics}
- Difficulty: ${difficulty}
- Duration: ${duration} minutes
- Total Marks: ${totalMarks}
- Teacher: ${teacherName || 'Class Teacher'}

SECTION REQUIREMENTS:
- Section A (Objective): Generate EXACTLY ${numMCQ} Multiple Choice Questions, each with options A, B, C, D. 1 mark each.
- Section B (Subjective): Generate EXACTLY ${numSubjective} questions with sub-parts (a, b, c) where appropriate.
${hasSectionC ? '- Section C: Additional subjective questions.' : ''}
${hasSectionD ? '- Section D: Essay/Composition questions.' : ''}
${isEnglishJHS ? ENGLISH_STRUCTURE_789 : ''}
${specialRule ? `\nSPECIAL RULE FOR ${subject.toUpperCase()}: ${specialRule.q1Rule}` : ''}

CRITICAL MARKING SCHEME RULES:
1. EVERY question MUST have an EXACT correct answer — not "model answer", not "suggested answer"
2. Math/Science questions MUST show full step-by-step working and calculations
3. Each sub-part must have its own correct answer and marks

Return ONLY valid JSON (no markdown, no backticks):
{
  "title": "exam title",
  "sectionA": [
    {
      "num": 1,
      "question": "question text",
      "options": {"A":"option A text","B":"option B text","C":"option C text","D":"option D text"},
      "correct": "A",
      "correctText": "Full text of correct option",
      "marks": 1,
      "topic": "topic name"
    }
  ],
  "sectionB": [
    {
      "num": 1,
      "isCompulsory": true,
      "question": "main question text",
      "totalMarks": 20,
      "subParts": [
        {
          "part": "a",
          "question": "sub-question text",
          "marks": 5,
          "correctAnswer": "EXACT correct answer here",
          "fullWorking": "Step 1: ...\nStep 2: ...\nAnswer: ..."
        }
      ]
    }
  ]
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const text = response.content.map(b => b.text || '').join('');
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed };
  } catch (err) {
    console.error('AI generation error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Generate marking scheme for an existing exam
 */
async function generateMarkingScheme(examination, questions) {
  const prompt = `Generate a COMPLETE marking scheme for this ALEYART ACADEMY examination.

Subject: ${examination.subject?.name}
Class: ${examination.class?.name}
Total Marks: ${examination.totalMarks}

MANDATORY REQUIREMENTS:
- Provide the EXACT correct answer for EVERY question
- Never use "model answer", "possible answer", or "suggested answer"
- For calculations: show EVERY step of working
- For definitions: give the complete precise definition
- For essays: provide a complete model with key points and marks breakdown

Questions:
${JSON.stringify(questions, null, 2)}

Return ONLY valid JSON:
{
  "schemeItems": [
    {
      "questionNumber": "1",
      "sectionLetter": "A",
      "questionText": "...",
      "correctAnswer": "EXACT answer",
      "fullSolution": "Complete step-by-step solution",
      "calculations": "All mathematical working",
      "marksAllocated": 1,
      "marksBreakdown": "1 mark for correct identification"
    }
  ]
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });
    const text = response.content.map(b => b.text || '').join('');
    const cleaned = text.replace(/```json|```/g, '').trim();
    return { success: true, data: JSON.parse(cleaned) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Regenerate answer when a question is edited
 */
async function regenerateAnswer(questionText, subject, cls, marks) {
  const prompt = `A question in an ALEYART ACADEMY ${subject} examination for ${cls} has been edited.

Question: "${questionText}"
Marks: ${marks}

Provide the EXACT correct answer with full working. Return JSON only:
{
  "correctAnswer": "exact answer",
  "fullSolution": "step by step working",
  "marksBreakdown": "marks allocation breakdown"
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });
    const text = response.content.map(b => b.text || '').join('');
    const cleaned = text.replace(/```json|```/g, '').trim();
    return { success: true, data: JSON.parse(cleaned) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { generateExamination, generateMarkingScheme, regenerateAnswer };
