const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
let model;

const initializeAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  return model;
};

/**
 * Generate interview questions based on role, experience, mode, and resume
 */
const generateQuestions = async (role, experience, mode, totalQuestions, resumeText = '') => {
  const ai = initializeAI();

  const resumeContext = resumeText
    ? `\n\nThe candidate's resume contains the following information:\n${resumeText}\n\nUse specific details from the resume (projects, skills, past experience) to create personalized questions.`
    : '';

  const modeInstructions = {
    technical: 'Focus on technical skills, problem-solving, coding concepts, system design, and domain-specific knowledge.',
    hr: 'Focus on behavioral questions, communication skills, teamwork, leadership, conflict resolution, and career goals.',
    both: 'Mix technical questions (60%) with HR/behavioral questions (40%). Cover both technical depth and soft skills.'
  };

  const prompt = `You are an expert interviewer conducting a ${mode} interview for a ${role} position. 
The candidate has ${experience} of experience.
${modeInstructions[mode]}
${resumeContext}

Generate exactly ${totalQuestions} interview questions. The questions should:
1. Be progressively harder (start easy, end challenging)
2. Be specific and relevant to the ${role} role
3. Test practical knowledge, not just theory
4. Include follow-up style questions that build on previous topics
${resumeText ? '5. Include at least 2 questions based on the candidate\'s resume/projects' : ''}

Return ONLY a valid JSON array of strings. No markdown, no explanation. Example format:
["Question 1?", "Question 2?", "Question 3?"]`;

  try {
    const result = await ai.generateContent(prompt);
    const response = result.response.text();
    
    // Clean the response - remove markdown code blocks if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    cleaned = cleaned.trim();
    
    const questions = JSON.parse(cleaned);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format');
    }

    return questions.slice(0, totalQuestions);
  } catch (error) {
    console.error('Error generating questions:', error.message);
    console.error('Full error details:', JSON.stringify(error?.response?.body || error?.errorDetails || error, null, 2));
    // Fallback questions based on mode
    return generateFallbackQuestions(role, mode, totalQuestions);
  }
};

/**
 * Evaluate a candidate's answer
 */
const evaluateAnswer = async (question, answer, role, experience) => {
  const ai = initializeAI();

  const prompt = `You are an expert interviewer evaluating a candidate's answer for a ${role} position (${experience} experience level).

Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer and provide:
1. A score from 0 to 10 (10 being perfect)
2. Brief, constructive feedback (2-3 sentences max)

Consider:
- Technical accuracy and depth
- Communication clarity
- Relevance to the question
- Practical understanding

Return ONLY valid JSON in this exact format (no markdown):
{"score": 7, "feedback": "Your feedback here."}`;

  try {
    const result = await ai.generateContent(prompt);
    const response = result.response.text();
    
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    cleaned = cleaned.trim();
    
    const evaluation = JSON.parse(cleaned);
    
    return {
      score: Math.min(10, Math.max(0, evaluation.score || 0)),
      feedback: evaluation.feedback || 'No feedback available.'
    };
  } catch (error) {
    console.error('Error evaluating answer:', error.message);
    console.error('Full error details:', JSON.stringify(error?.response?.body || error?.errorDetails || error, null, 2));
    return {
      score: 5,
      feedback: 'Unable to evaluate the answer at this time. Please review manually.'
    };
  }
};

/**
 * Generate final interview report
 */
const generateReport = async (interview) => {
  const ai = initializeAI();

  const questionsData = interview.questions.map((q, i) => ({
    number: i + 1,
    question: q.questionText,
    answer: q.answerText,
    score: q.score
  }));

  const avgScore = interview.questions.reduce((sum, q) => sum + q.score, 0) / interview.questions.length;

  const prompt = `You are an expert interview evaluator. Analyze the following interview for a ${interview.role} position (${interview.experience} experience, ${interview.mode} interview mode).

Questions and Answers:
${JSON.stringify(questionsData, null, 2)}

Average Score: ${avgScore.toFixed(1)}/10

Provide a comprehensive evaluation. Return ONLY valid JSON (no markdown):
{
  "overallScore": ${Math.round(avgScore)},
  "overallFeedback": "A 3-4 sentence overall assessment of the candidate's performance.",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improvements": ["improvement suggestion 1", "improvement suggestion 2", "improvement suggestion 3"]
}`;

  try {
    const result = await ai.generateContent(prompt);
    const response = result.response.text();
    
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    cleaned = cleaned.trim();
    
    const report = JSON.parse(cleaned);
    
    return {
      overallScore: Math.min(10, Math.max(0, report.overallScore || Math.round(avgScore))),
      overallFeedback: report.overallFeedback || 'Interview completed.',
      strengths: report.strengths || [],
      weaknesses: report.weaknesses || [],
      improvements: report.improvements || []
    };
  } catch (error) {
    console.error('Error generating report:', error.message);
    console.error('Full error details:', JSON.stringify(error?.response?.body || error?.errorDetails || error, null, 2));
    return {
      overallScore: Math.round(avgScore),
      overallFeedback: `You completed a ${interview.mode} interview for ${interview.role} with an average score of ${avgScore.toFixed(1)}/10.`,
      strengths: ['Completed all questions'],
      weaknesses: ['Report generation encountered an issue'],
      improvements: ['Try again for a detailed analysis']
    };
  }
};

/**
 * Fallback questions if AI fails
 */
const generateFallbackQuestions = (role, mode, count) => {
  const technicalQuestions = [
    `Tell me about your experience with ${role}-related technologies.`,
    `What are the key skills required for a ${role}?`,
    `Can you explain a challenging project you've worked on?`,
    `How do you approach problem-solving in your work?`,
    `What best practices do you follow in your development process?`,
    `Explain a technical concept that is important for this role.`,
    `How do you handle debugging complex issues?`,
    `What tools and technologies are you most comfortable with?`,
    `How do you stay updated with the latest trends in your field?`,
    `Describe your ideal development workflow.`
  ];

  const hrQuestions = [
    'Tell me about yourself and your career journey.',
    'What motivates you to apply for this role?',
    'Describe a situation where you had to work under pressure.',
    'How do you handle disagreements with team members?',
    'Where do you see yourself in 5 years?',
    'What is your greatest strength and weakness?',
    'Tell me about a time you showed leadership.',
    'How do you prioritize tasks when working on multiple projects?',
    'Why should we hire you for this position?',
    'Do you have any questions for us?'
  ];

  let questions = mode === 'hr' ? hrQuestions : technicalQuestions;
  if (mode === 'both') {
    questions = [...technicalQuestions.slice(0, Math.ceil(count * 0.6)), ...hrQuestions.slice(0, Math.floor(count * 0.4))];
  }

  return questions.slice(0, count);
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  generateReport
};
