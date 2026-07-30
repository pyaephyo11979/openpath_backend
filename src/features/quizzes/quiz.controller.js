const quizModel = require('#models/quiz.model.js');

const getQuizByCourseId = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const quiz = await quizModel.getQuizByCourseId(courseId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found for this course' });
    }

    return res.status(200).json({ data: quiz });
  } catch (error) {
    console.error('Error fetching quiz by course ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const userId = req.userId;
    const quizId = parseInt(req.params.quizId, 10);
    const { responses } = req.body;

    const quiz = await quizModel.getQuizWithAnswers(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const userAnswersToSave = [];

    for (const response of responses) {
      const dbQuestion = quiz.questions.find(
        (q) => q.id === response.questionId
      );
      if (!dbQuestion) continue;

      const selectedDbAnswer = dbQuestion.answers.find(
        (a) => a.id === response.answerId
      );

      if (selectedDbAnswer && selectedDbAnswer.correct) {
        correctCount++;
      }

      userAnswersToSave.push({
        answerId: response.answerId,
      });
    }

    const score = (correctCount / totalQuestions) * 100;
    const passed = score >= 70;

    const attempt = await quizModel.saveQuizAttempt(
      userId,
      quizId,
      score,
      passed,
      userAnswersToSave
    );

    return res.status(201).json({
      message: 'Quiz graded successfully',
      data: {
        attemptId: attempt.id,
        score,
        passed,
        correctCount,
        totalQuestions,
      },
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    const quiz = await quizModel.getQuizById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    return res.status(200).json({ data: quiz });
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getQuizByCourseId,
  submitQuiz,
  getQuizById,
};
