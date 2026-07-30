const courseController = require('./course.controller');
const express = require('express');
const router = express.Router();
const { checkAuth } = require('#middlewares/auth.middleware.js');

router.get('/', checkAuth, courseController.getAllCourses);
router.get('/trending', courseController.getTrendingCourses);
router.get('/enrollments', checkAuth, courseController.getEnrollmentsByUserId);
router.post('/enroll/:courseId', checkAuth, courseController.enrollInCourse);
router.get('/:id', checkAuth, courseController.getCourseById);

module.exports = router;
