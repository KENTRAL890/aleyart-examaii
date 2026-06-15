import { v4 as uuidv4 } from 'uuid';
import { Question, QuestionType, DifficultyLevel, ExamSection, SubQuestion } from '../types';

interface GenerateQuestionsParams {
  subject: string;
  classLevel: string;
  topics: string[];
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  difficulty: DifficultyLevel;
  marksPerQuestion?: number;
  isCompulsory?: boolean;
  isPractical?: boolean;
}

// Sample question templates for different subjects
const QUESTION_TEMPLATES = {
  mathematics: {
    multiple_choice: [
      { q: 'What is {a} + {b}?', answer: '{sum}', options: ['{sum}', '{wrong1}', '{wrong2}', '{wrong3}'] },
      { q: 'Find the product of {a} and {b}.', answer: '{product}', options: ['{product}', '{wrong1}', '{wrong2}', '{wrong3}'] },
      { q: 'What is {a} - {b}?', answer: '{diff}', options: ['{diff}', '{wrong1}', '{wrong2}', '{wrong3}'] },
      { q: 'Calculate {a} × {b}.', answer: '{product}', options: ['{product}', '{wrong1}', '{wrong2}', '{wrong3}'] },
      { q: 'What is {a} ÷ {b}?', answer: '{quotient}', options: ['{quotient}', '{wrong1}', '{wrong2}', '{wrong3}'] },
    ],
    problem_solving: [
      { q: 'A farmer has {a} goats. He buys {b} more goats. How many goats does he have now?', answer: '{sum} goats', workings: '{a} + {b} = {sum}' },
      { q: 'Kofi has GH₵{a}. He spends GH₵{b} on books. How much money does he have left?', answer: 'GH₵{diff}', workings: '{a} - {b} = {diff}' },
      { q: 'A rectangle has length {a}cm and width {b}cm. Calculate its area.', answer: '{product} cm²', workings: 'Area = length × width = {a} × {b} = {product} cm²' },
    ],
  },
  science: {
    multiple_choice: [
      { q: 'Which part of the plant absorbs water and minerals from the soil?', answer: 'B. Roots', options: ['A. Leaves', 'B. Roots', 'C. Stem', 'D. Flowers'] },
      { q: 'What is the process by which green plants make their own food?', answer: 'A. Photosynthesis', options: ['A. Photosynthesis', 'B. Respiration', 'C. Transpiration', 'D. Digestion'] },
      { q: 'Which organ pumps blood around the body?', answer: 'C. Heart', options: ['A. Lungs', 'B. Liver', 'C. Heart', 'D. Kidney'] },
      { q: 'What gas do plants release during photosynthesis?', answer: 'B. Oxygen', options: ['A. Carbon dioxide', 'B. Oxygen', 'C. Nitrogen', 'D. Hydrogen'] },
      { q: 'Which state of matter has a definite shape and volume?', answer: 'A. Solid', options: ['A. Solid', 'B. Liquid', 'C. Gas', 'D. Plasma'] },
    ],
    short_answer: [
      { q: 'Name the three states of matter.', answer: 'Solid, Liquid, and Gas' },
      { q: 'What is the function of the lungs?', answer: 'The lungs are responsible for breathing and gas exchange (taking in oxygen and releasing carbon dioxide).' },
      { q: 'State two ways of conserving water.', answer: '1. Closing taps when not in use\n2. Fixing leaking pipes' },
    ],
    practical: [
      { q: 'Design an experiment to show that plants need sunlight to grow. Include:\n(a) Materials needed\n(b) Procedure\n(c) Expected results', answer: '(a) Materials: Two potted plants, water, cardboard box\n(b) Procedure:\n1. Place one plant in sunlight and another in a dark box\n2. Water both plants equally for 2 weeks\n3. Observe and record changes\n(c) Expected results: Plant in sunlight will grow healthy while plant in dark box will turn yellow and wilt' },
    ],
  },
  english: {
    multiple_choice: [
      { q: 'Choose the correct form of the verb: She _____ to school every day.', answer: 'B. goes', options: ['A. go', 'B. goes', 'C. going', 'D. went'] },
      { q: 'Which word is a noun?', answer: 'C. Table', options: ['A. Run', 'B. Beautiful', 'C. Table', 'D. Quickly'] },
      { q: 'Select the correct pronoun: _____ is my book.', answer: 'A. This', options: ['A. This', 'B. These', 'C. Those', 'D. They'] },
      { q: 'What is the past tense of "eat"?', answer: 'B. ate', options: ['A. eated', 'B. ate', 'C. eaten', 'D. eating'] },
      { q: 'Which sentence is correct?', answer: 'A. She is a good student.', options: ['A. She is a good student.', 'B. She is good student.', 'C. She good student is.', 'D. Good student she is.'] },
    ],
    fill_blank: [
      { q: 'The boy _____ (run) to school every morning.', answer: 'runs' },
      { q: 'They _____ (be) very happy yesterday.', answer: 'were' },
      { q: 'She has _____ (write) a beautiful poem.', answer: 'written' },
    ],
    composition: [
      { q: 'Write a composition of about 200 words on the topic: "My Best Friend"', answer: 'Content: Clear introduction of the friend, physical description, qualities, shared experiences, conclusion.\nOrganization: Introduction (2 marks), Body (4 marks), Conclusion (2 marks)\nLanguage: Grammar and spelling (2 marks)' },
      { q: 'Write a letter to your uncle thanking him for a gift he sent you.', answer: 'Format: Address, date, salutation, body, closing (3 marks)\nContent: Expression of gratitude, description of gift, how gift will be used (4 marks)\nLanguage: Grammar and expression (3 marks)' },
    ],
  },
  computing: {
    multiple_choice: [
      { q: 'Which part of the computer is known as the brain?', answer: 'B. CPU', options: ['A. Monitor', 'B. CPU', 'C. Keyboard', 'D. Mouse'] },
      { q: 'What does RAM stand for?', answer: 'A. Random Access Memory', options: ['A. Random Access Memory', 'B. Read Access Memory', 'C. Run Access Memory', 'D. Ready Access Memory'] },
      { q: 'Which of these is an input device?', answer: 'C. Keyboard', options: ['A. Monitor', 'B. Printer', 'C. Keyboard', 'D. Speaker'] },
      { q: 'What is the function of the monitor?', answer: 'B. To display output', options: ['A. To input data', 'B. To display output', 'C. To store data', 'D. To process data'] },
      { q: 'Which software is used for creating documents?', answer: 'A. Microsoft Word', options: ['A. Microsoft Word', 'B. Microsoft Excel', 'C. Paint', 'D. Calculator'] },
    ],
    practical: [
      { q: 'Write an algorithm to add two numbers and display the result.', answer: 'Algorithm:\n1. START\n2. INPUT first number A\n3. INPUT second number B\n4. CALCULATE Sum = A + B\n5. DISPLAY Sum\n6. STOP' },
      { q: 'Draw a flowchart to find the largest of two numbers.', answer: 'START → Input A, B → Decision: Is A > B? → YES: Display A is largest / NO: Display B is largest → STOP' },
    ],
  },
  rme: {
    multiple_choice: [
      { q: 'Which of the following is a moral value?', answer: 'A. Honesty', options: ['A. Honesty', 'B. Theft', 'C. Laziness', 'D. Greed'] },
      { q: 'Who is considered the father of the Christian faith?', answer: 'B. Abraham', options: ['A. Moses', 'B. Abraham', 'C. David', 'D. Peter'] },
      { q: 'What is the Golden Rule?', answer: 'A. Treat others as you want to be treated', options: ['A. Treat others as you want to be treated', 'B. Always win at any cost', 'C. Look after yourself first', 'D. Trust no one'] },
    ],
    case_study: [
      { 
        q: `Read the following story and answer the questions that follow:\n\nKwame found a wallet containing GH₵500 on his way to school. He could easily have kept the money, but instead, he took it to the headteacher's office. The owner, an old woman, was very grateful and blessed Kwame.\n\n(a) What moral value did Kwame demonstrate?\n(b) Give two reasons why honesty is important.\n(c) What would you have done if you were in Kwame's situation? Explain.`,
        answer: '(a) Kwame demonstrated HONESTY.\n\n(b) Two reasons why honesty is important:\n1. It builds trust between people in society.\n2. It promotes peace and harmony in the community.\n\n(c) I would have done the same as Kwame because:\n- It is the right thing to do according to moral teachings.\n- The money does not belong to me.\n- Keeping it would be stealing.\n- I would feel guilty if I kept what belongs to another person.'
      },
    ],
  },
};

// Generate random numbers for math questions
const generateMathValues = (difficulty: DifficultyLevel) => {
  let range = { min: 1, max: 20 };
  if (difficulty === 'medium') range = { min: 10, max: 100 };
  if (difficulty === 'hard') range = { min: 50, max: 500 };
  
  const a = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  const b = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  
  return {
    a,
    b,
    sum: a + b,
    diff: Math.abs(a - b),
    product: a * b,
    quotient: Math.floor(a / b),
    wrong1: a + b + Math.floor(Math.random() * 10) + 1,
    wrong2: a + b - Math.floor(Math.random() * 10) - 1,
    wrong3: a * 2,
  };
};

// Replace placeholders in template
const fillTemplate = (template: string, values: Record<string, number | string>): string => {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }
  return result;
};

export const generateQuestions = async (params: GenerateQuestionsParams): Promise<Question[]> => {
  const questions: Question[] = [];
  const { subject, numberOfQuestions, questionTypes, difficulty, marksPerQuestion = 1, isCompulsory, isPractical } = params;
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const subjectKey = subject.toLowerCase().replace(/\s+/g, '_').replace('_language', '');
  const templates = QUESTION_TEMPLATES[subjectKey as keyof typeof QUESTION_TEMPLATES] || QUESTION_TEMPLATES.science;
  
  for (let i = 0; i < numberOfQuestions; i++) {
    const questionType = questionTypes[i % questionTypes.length];
    const typeTemplates = templates[questionType as keyof typeof templates] || templates.multiple_choice;
    
    if (!typeTemplates || typeTemplates.length === 0) continue;
    
    const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
    
    let questionText = template.q;
    let answerText = template.answer;
    let workings = (template as any).workings || '';
    let options: { id: string; label: string; text: string; isCorrect: boolean }[] | undefined;
    
    // For math questions, fill in the values
    if (subjectKey === 'mathematics') {
      const values = generateMathValues(difficulty);
      questionText = fillTemplate(questionText, values);
      answerText = fillTemplate(answerText, values);
      workings = fillTemplate(workings, values);
      
      if (template.options) {
        const labels = ['A', 'B', 'C', 'D'];
        const filledOptions = template.options.map((opt: string) => fillTemplate(opt, values));
        const correctIndex = Math.floor(Math.random() * 4);
        const shuffledOptions = [...filledOptions];
        [shuffledOptions[0], shuffledOptions[correctIndex]] = [shuffledOptions[correctIndex], shuffledOptions[0]];
        
        options = shuffledOptions.map((opt, idx) => ({
          id: uuidv4(),
          label: labels[idx],
          text: opt.replace(/^[A-D]\.\s*/, ''),
          isCorrect: idx === correctIndex || opt === fillTemplate(template.answer, values),
        }));
        
        // Fix the correct answer based on shuffled position
        const correctOption = options.find(o => o.text === fillTemplate(template.answer, values).replace(/^[A-D]\.\s*/, ''));
        if (correctOption) {
          answerText = `${correctOption.label}. ${correctOption.text}`;
        }
      }
    } else if (template.options) {
      const labels = ['A', 'B', 'C', 'D'];
      options = template.options.map((opt: string, idx: number) => ({
        id: uuidv4(),
        label: labels[idx],
        text: opt.replace(/^[A-D]\.\s*/, ''),
        isCorrect: opt === template.answer || opt.replace(/^[A-D]\.\s*/, '') === template.answer.replace(/^[A-D]\.\s*/, ''),
      }));
    }
    
    const question: Question = {
      id: uuidv4(),
      type: questionType,
      text: questionText,
      options,
      answer: answerText,
      workings: workings || undefined,
      marks: marksPerQuestion,
      topic: params.topics[0] || 'General',
      difficulty,
      isCompulsory: i === 0 && isCompulsory,
      isPractical: i === 0 && isPractical,
    };
    
    questions.push(question);
  }
  
  return questions;
};

export const generateExamSection = async (
  sectionName: string,
  sectionLabel: string,
  params: GenerateQuestionsParams,
  isObjective: boolean
): Promise<ExamSection> => {
  const questions = await generateQuestions(params);
  
  return {
    id: uuidv4(),
    name: sectionName,
    label: sectionLabel,
    instructions: isObjective 
      ? 'Answer ALL questions in this section. Each question carries equal marks.'
      : 'Answer the required number of questions from this section.',
    questionType: isObjective ? 'objective' : 'subjective',
    questions,
    totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    columns: isObjective ? 2 : 1,
    hasVerticalDivider: isObjective,
  };
};

export const generateMarkingSchemeFromExam = (exam: { sections: ExamSection[] }) => {
  return exam.sections.map(section => ({
    sectionId: section.id,
    sectionName: section.name,
    answers: section.questions.map((q, idx) => ({
      questionId: q.id,
      questionNumber: idx + 1,
      questionText: q.text,
      answer: q.answer,
      workings: q.workings,
      marks: q.marks,
      subAnswers: q.subQuestions?.map(sq => ({
        subQuestionId: sq.id,
        label: sq.label,
        answer: sq.answer,
        workings: sq.workings,
        marks: sq.marks,
      })),
    })),
  }));
};

export const generateRMEScenarioQuestion = async (): Promise<Question> => {
  const scenarios = [
    {
      story: `Ama found a mobile phone in the school compound. She knew it belonged to a student in the senior class. Instead of keeping it, she immediately reported to the class teacher who helped return it to the owner. The owner was very happy and thanked Ama.`,
      questions: [
        { label: '(a)', text: 'What moral value did Ama show?', answer: 'Ama showed HONESTY.', marks: 2 },
        { label: '(b)', text: 'Why is it wrong to keep what does not belong to you?', answer: 'It is wrong because:\n1. It is a form of stealing\n2. It causes loss to the owner\n3. It is against moral and religious teachings', marks: 4 },
        { label: '(c)', text: 'State two benefits of being honest.', answer: '1. People will trust you\n2. You will have a clear conscience\n3. It promotes peace in society', marks: 4 },
      ],
    },
    {
      story: `Kofi was known in his community for always helping elderly people. One day, he saw an old woman struggling to carry her load from the market. Without being asked, Kofi offered to help carry the load to her house.`,
      questions: [
        { label: '(a)', text: 'What moral value did Kofi demonstrate?', answer: 'Kofi demonstrated KINDNESS and HELPFULNESS.', marks: 2 },
        { label: '(b)', text: 'Give three reasons why we should help the elderly.', answer: '1. They are weaker and need assistance\n2. It shows respect for elders\n3. It is our moral duty as young people\n4. They have contributed to society and deserve care', marks: 4 },
        { label: '(c)', text: 'How can you help elderly people in your community?', answer: '1. Help them carry their loads\n2. Visit them regularly\n3. Run errands for them\n4. Listen to their advice and stories', marks: 4 },
      ],
    },
  ];
  
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  const subQuestions: SubQuestion[] = scenario.questions.map(q => ({
    id: uuidv4(),
    label: q.label,
    text: q.text,
    marks: q.marks,
    answer: q.answer,
  }));
  
  return {
    id: uuidv4(),
    type: 'case_study',
    text: `Read the following story carefully and answer the questions that follow:\n\n${scenario.story}`,
    subQuestions,
    answer: subQuestions.map(sq => `${sq.label} ${sq.answer}`).join('\n\n'),
    marks: subQuestions.reduce((sum, sq) => sum + sq.marks, 0),
    topic: 'Moral Values',
    difficulty: 'medium',
    isCompulsory: true,
    isPractical: false,
  };
};

export const generatePracticalQuestion = async (subject: string): Promise<Question> => {
  const practicalQuestions: Record<string, Question[]> = {
    computing: [
      {
        id: uuidv4(),
        type: 'practical',
        text: 'Write an algorithm to calculate the area of a rectangle. Your algorithm should:\n(a) Accept the length and width as input\n(b) Calculate the area\n(c) Display the result',
        answer: 'Algorithm:\n1. START\n2. INPUT length\n3. INPUT width\n4. CALCULATE area = length × width\n5. DISPLAY "The area of the rectangle is " + area\n6. STOP',
        marks: 10,
        topic: 'Algorithms',
        difficulty: 'medium',
        isCompulsory: true,
        isPractical: true,
        subQuestions: [
          { id: uuidv4(), label: '(a)', text: 'Write the algorithm in steps', answer: '1. START\n2. INPUT length\n3. INPUT width\n4. CALCULATE area = length × width\n5. DISPLAY area\n6. STOP', marks: 6 },
          { id: uuidv4(), label: '(b)', text: 'Draw a flowchart for the algorithm', answer: 'START → Input length, width → Calculate area = length × width → Display area → STOP', marks: 4 },
        ],
      },
      {
        id: uuidv4(),
        type: 'practical',
        text: 'Create a simple webpage using HTML. The webpage should contain:\n(a) A heading with your school name\n(b) A paragraph about your school\n(c) An image placeholder',
        answer: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My School</title>\n</head>\n<body>\n  <h1>ALEYART ACADEMY</h1>\n  <p>ALEYART Academy is a leading educational institution committed to academic excellence.</p>\n  <img src="school.jpg" alt="School Image">\n</body>\n</html>',
        marks: 10,
        topic: 'Web Design',
        difficulty: 'medium',
        isCompulsory: true,
        isPractical: true,
      },
    ],
    science: [
      {
        id: uuidv4(),
        type: 'practical',
        text: 'Design an experiment to demonstrate that air occupies space.\n(a) List the materials needed\n(b) Describe the procedure\n(c) State your expected observation\n(d) Write your conclusion',
        answer: '(a) Materials:\n- Empty bottle\n- Bowl of water\n- Balloon\n\n(b) Procedure:\n1. Push the empty bottle into the bowl of water with its mouth facing down\n2. Observe the water level inside the bottle\n3. Tilt the bottle slightly\n4. Observe what happens\n\n(c) Expected observation:\n- Water does not fill the bottle when pushed straight down\n- Bubbles escape when the bottle is tilted\n\n(d) Conclusion:\nAir occupies space in the bottle and prevents water from entering until the air escapes.',
        marks: 10,
        topic: 'Matter',
        difficulty: 'medium',
        isCompulsory: true,
        isPractical: true,
      },
    ],
    career_tech: [
      {
        id: uuidv4(),
        type: 'practical',
        text: 'Design a simple product packaging for a local fruit juice company.\n(a) Sketch the packaging design\n(b) Include the product name and logo\n(c) List the required information on the packaging\n(d) Explain your design choices',
        answer: '(a) [Sketch of a rectangular juice box with appropriate dimensions]\n\n(b) Product Name: FRESH GHANA JUICE\n    Logo: [Stylized fruit with Ghana colors]\n\n(c) Required information:\n- Product name\n- Ingredients list\n- Nutritional information\n- Manufacturing and expiry dates\n- Company address and contact\n- Net volume\n- Storage instructions\n\n(d) Design choices:\n- Used bright colors to attract customers\n- Made the product name large and visible\n- Included Ghana flag colors to show local origin\n- Easy-to-read font for information',
        marks: 10,
        topic: 'Product Development',
        difficulty: 'medium',
        isCompulsory: true,
        isPractical: true,
      },
    ],
    creative_arts_design: [
      {
        id: uuidv4(),
        type: 'practical',
        text: 'Create a design for a school event poster.\n(a) The event is the Annual Cultural Day\n(b) Include the date, time, and venue\n(c) Use appropriate colors and imagery\n(d) Make sure the design is eye-catching',
        answer: 'Design Elements:\n\n(a) Title: ANNUAL CULTURAL DAY in bold, decorative font\n\n(b) Event Details:\n- Date: [Current date + 2 weeks]\n- Time: 9:00 AM - 4:00 PM\n- Venue: School Assembly Hall\n\n(c) Visual Elements:\n- Traditional Kente patterns as border\n- Images of traditional dancers\n- Ghana flag colors (red, gold, green, black)\n- Traditional symbols (Adinkra)\n\n(d) Layout:\n- Title at top (largest)\n- Images in center\n- Details at bottom\n- School logo and motto',
        marks: 10,
        topic: 'Design',
        difficulty: 'medium',
        isCompulsory: true,
        isPractical: true,
      },
    ],
  };
  
  const subjectKey = subject.toLowerCase().replace(/\s+/g, '_');
  const questions = practicalQuestions[subjectKey] || practicalQuestions.computing;
  return questions[Math.floor(Math.random() * questions.length)];
};
