const lessonController = require('./lesson.controller');
const express = require('express');
const router = express.Router();
const { checkAuth } = require('#middlewares/auth.middleware.js');

router.get(
  '/course/:courseId',
  checkAuth,
  lessonController.getAllLessonsByCourseId
);
router.get('/:id', checkAuth, lessonController.getLessonById);
router.post('/:lessonId/complete', checkAuth, lessonController.completeLesson);
router.put('/:lessonTrackId', checkAuth, lessonController.updateLessonTrack);

module.exports = router;
