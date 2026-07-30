const adminController = require('./admin.controller');
const express = require('express');
const router = express.Router();
const { isAdmin } = require('#middlewares/auth.middleware.js');
const upload = require('#middlewares/upload.middleware.js');
router.use(isAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/courses', adminController.getAllCourses);
router.post('/courses', upload.single('image'), adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);
router.get('/lessons', adminController.getAllLessons);
router.post('/lessons', adminController.createLesson);
router.put('/lessons/:id', adminController.updateLesson);
router.delete('/lessons/:id', adminController.deleteLesson);
router.post('/send-notification', adminController.sendNotification);
router.get('/fcm-tokens', adminController.getAllFcmTokens);
router.get('/fcm-token/:userId', adminController.getFcmTokenByUserId);
router.get('/quizzes/course/:courseId', adminController.getQuizByCourseId);
router.post('/quizzes', adminController.createQuiz);
router.delete(
  '/quizzes/question/:questionId',
  adminController.deleteQuestionById
);
router.delete('/quizzes/answer/:answerId', adminController.deleteAnswerById);
router.delete;
router.post('/questions', adminController.createQuestion);
router.post('/answers', adminController.createAnswer);
router.get(
  '/quiz-attempts/user/:userId',
  adminController.getQuizAttemptsByUserId
);
router.get('/quiz-attempts/:attemptId', adminController.getQuizAttemptById);
router.post(
  '/enrollments/acccpet/:enrollmentId',
  adminController.accpetEnrollmentRequest
);
router.post(
  '/enrollments/reject/:enrollmentId',
  adminController.rejectEnrollmentRequest
);

module.exports = router;
