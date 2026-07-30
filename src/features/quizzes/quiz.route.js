const express = require('express');
const router = express.Router();
const quizController = require('./quiz.controller.js');
const authMiddleware = require('#middlewares/auth.middleware.js');

router.get(
  '/course/:courseId',
  authMiddleware.checkAuth,
  quizController.getQuizByCourseId
);
router.get('/:quizId', authMiddleware.checkAuth, quizController.getQuizById);
router.post(
  '/submit/:quizId',
  authMiddleware.checkAuth,
  quizController.submitQuiz
);

module.exports = router;
