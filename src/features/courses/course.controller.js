const courseModel = require('#models/course.model.js');
const { getMessaging } = require('firebase-admin/messaging');
const userModel = require('#models/user.model.js');
const lessonModel = require('#models/lesson.model.js');
const e = require('express');

const getAllCourses = async (req, res) => {
  try {
    const query = req.query.search;
    const courses = query
      ? await courseModel.searchCourseByTitle(query)
      : await courseModel.getCourses();
    if (courses.length > 0) {
      await Promise.all(
        courses.map(async (course) => {
          let isEnrolled = false;
          isEnrolled = await courseModel.isUserEnrolledInCourse(
            req.userId,
            course.id
          );
          course.enrollmentStatus =
            await courseModel.getEnrollmentStatusByUserIdAndCourseId(
              req.userId,
              course.id
            );
          course.isEnrolled = isEnrolled;
        })
      );
    }
    res
      .status(200)
      .json({ message: 'Courses fetched successfully', data: courses });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await courseModel.getCourseById(parseInt(id));
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    let isEnrolled = await courseModel.isUserEnrolledInCourse(
      req.userId,
      course.id
    );
    course.enrollmentStatus =
      await courseModel.getEnrollmentStatusByUserIdAndCourseId(
        req.userId,
        course.id
      );
    course.isEnrolled = isEnrolled;
    res
      .status(200)
      .json({ message: 'Course fetched successfully', data: course });
  } catch (err) {
    console.error('Error fetching course by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const enrollInCourse = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.userId;
  try {
    const enrollment = await courseModel.enrollInCourse(
      userId,
      parseInt(courseId)
    );
    const lessons = await lessonModel.getLessonsByCourseId(parseInt(courseId));
    for (const lesson of lessons) {
      await lessonModel.createLessonTrack({ userId, lessonId: lesson.id });
    }
    res
      .status(200)
      .json({ message: 'Enrolled in course successfully', data: enrollment });
  } catch (err) {
    console.error('Error enrolling in course:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEnrollmentsByUserId = async (req, res) => {
  const userId = req.userId;
  try {
    const enrollments = await courseModel.getEnrollmentsByUserId(userId);
    await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await courseModel.getCourseById(enrollment.courseId);
        enrollment.course = course;
        enrollment.course.status = await courseModel.getCourseStatusByCouseId(
          enrollment.courseId
        );
        let isEnrolled = await courseModel.isUserEnrolledInCourse(
          userId,
          enrollment.course.id
        );
        enrollment.course.isEnrolled = isEnrolled;
        enrollment.course.enrollmentStatus =
          await courseModel.getEnrollmentStatusByUserIdAndCourseId(
            userId,
            enrollment.course.id
          );
      })
    );
    res
      .status(200)
      .json({ message: 'Enrollments fetched successfully', data: enrollments });
  } catch (err) {
    console.error('Error fetching enrollments by user ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTrendingCourses = async (req, res) => {
  try {
    const trendingCourses = await courseModel.getTrendingCourses();
    await Promise.all(
      trendingCourses.map(async (course) => {
        let isEnrolled = false;
        isEnrolled = await courseModel.isUserEnrolledInCourse(
          req.userId,
          course.id
        );
        course.isEnrolled = isEnrolled;
        course.enrollmentStatus =
          await courseModel.getEnrollmentStatusByUserIdAndCourseId(
            req.userId,
            course.id
          );
      })
    );
    res.status(200).json({
      message: 'Trending courses fetched successfully',
      data: trendingCourses,
    });
  } catch (err) {
    console.error('Error fetching trending courses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  enrollInCourse,
  getEnrollmentsByUserId,
  getTrendingCourses,
};
