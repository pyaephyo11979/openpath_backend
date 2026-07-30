const prisma = require('#utils/prisma.js');

const getQuizByCourseId = async (courseId) => {
  try {
    const quiz = await prisma.quizzes.findFirst({
      where: { courseId: courseId },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
    return quiz;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getQuizById = async (quizId) => {
  try {
    const quiz = await prisma.quizzes.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
    return quiz;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getAnswersByQuizId = async (quizId) => {
  try {
    const answers = await prisma.quizzes.findMany({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
    return answers;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const createQuiz = async (quizData) => {
  try {
    const quiz = await prisma.quizzes.create({
      data: quizData,
    });
    return quiz;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const createQuestion = async (questionData) => {
  try {
    const question = await prisma.questions.create({
      data: questionData,
    });
    return question;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const createAnswer = async (answerData) => {
  try {
    const answer = await prisma.answers.create({
      data: answerData,
    });
    return answer;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const recordUserAnswer = async (userAnswerData) => {
  try {
    const userAnswer = await prisma.userQuizAnswer.create({
      data: userAnswerData,
    });
    return userAnswer;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getUserAnswersByQuizId = async (quizId, userId) => {
  try {
    const userAnswers = await prisma.userQuizAnswer.findMany({
      where: {
        quizId: quizId,
        userId: userId,
      },
      include: {
        answer: true,
      },
    });
    return userAnswers;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getScoreByQuizId = async (quizId, userId) => {
  try {
    return score;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getQuizWithAnswers = async (quizId) => {
  return await prisma.quizzes.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: {
          answers: true,
        },
      },
    },
  });
};

const saveQuizAttempt = async (
  userId,
  quizId,
  score,
  passed,
  userAnswersToSave
) => {
  return await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      passed,
      answers: {
        create: userAnswersToSave,
      },
    },
    include: {
      answers: {
        include: {
          answer: true,
        },
      },
    },
  });
};

const getQuizAttemptById = async (attemptId) => {
  return await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: {
          answer: true,
        },
      },
    },
  });
};

const getQuizAttemptsByUserId = async (userId) => {
  return await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      answers: {
        include: {
          answer: true,
        },
      },
    },
  });
};

module.exports = {
  getQuizByCourseId,
  getQuizById,
  getAnswersByQuizId,
  createQuiz,
  createQuestion,
  createAnswer,
  recordUserAnswer,
  getUserAnswersByQuizId,
  getScoreByQuizId,
  getQuizWithAnswers,
  saveQuizAttempt,
  getQuizAttemptById,
  getQuizAttemptsByUserId,
};
