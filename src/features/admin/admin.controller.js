require('dotenv').config();
const userModel = require('#models/user.model.js');
const courseModel = require('#models/course.model.js');
const lessonModel = require('#models/lesson.model.js');
const courseSchema = require('#schemas/course.schema.js');
const lessonSchema = require('#schemas/lesson.schema.js');
const { getMessaging } = require('firebase-admin/messaging');
const quizModel = require('#models/quiz.model.js');

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await courseModel.getCourses();
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllLessons = async (req, res) => {
  try {
    const lessons = await lessonModel.getLessons();
    res.status(200).json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createLesson = async (req, res) => {
  try {
    const lessonData = req.body;
    lessonSchema.validate(lessonData, { abortEarly: false });
    const newLesson = await lessonModel.createLesson(lessonData);
    res.status(201).json(newLesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    const lessonData = req.body;
    lessonSchema.validate(lessonData, { abortEarly: false });
    const updatedLesson = await lessonModel.updateLesson(lessonId, lessonData);
    res.status(200).json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id, 10);
    await lessonModel.deleteLesson(lessonId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    let { title, description, price, published } = req.body;

    // Parse price and published properly if they come from formData as strings
    if (price !== undefined && typeof price === 'string') {
      price = parseFloat(price);
    }
    if (published !== undefined && typeof published === 'string') {
      published = published === 'true';
    }

    const courseData = { title, description };
    if (price !== undefined) courseData.price = price;
    if (published !== undefined) courseData.published = published;

    if (req.file) {
      const imageUrl = `${process.env.BUCKET_URL}/${req.file.key}`;
      courseData.imageUrl = imageUrl;
    }
    courseSchema.validate(courseData, { abortEarly: false });
    const newCourse = await courseModel.createCourse(courseData);
    return res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const courseData = req.body;
    if (req.file) {
      const imageUrl = `${process.env.BUCKET_URL}/${req.file.key}`;
      courseData.imageUrl = imageUrl;
    }
    courseSchema.validate(courseData, { abortEarly: false });
    const updatedCourse = await courseModel.updateCourse(courseId, courseData);
    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    await courseModel.deleteCourse(courseId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { title, body, token } = req.body;

    if (!title || !body || !token) {
      return res
        .status(400)
        .json({ message: 'Title, body, and token are required' });
    }

    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    const response = await getMessaging().send(message);
    res
      .status(200)
      .json({ message: 'Notification sent successfully', response });
  } catch (error) {
    if (
      error.code === 'messaging/invalid-argument' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      await userModel.clearFcmToken(req.body.token);
      return res
        .status(400)
        .json({ message: 'Invalid FCM token. Token has been removed.' });
    }
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFcmTokenByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const fcmToken = await userModel.getFcmTokenByUserId(parseInt(userId));
    if (!fcmToken) {
      return res.status(404).json({ message: 'FCM token not found' });
    }
    res.status(200).json({ fcmToken });
  } catch (error) {
    console.error('Error fetching FCM token by user ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllFcmTokens = async (req, res) => {
  try {
    const fcmTokens = await userModel.getFcmTokens();
    res.status(200).json({ fcmTokens });
  } catch (error) {
    console.error('Error fetching all FCM tokens:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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

const createQuiz = async (req, res) => {
  try {
    const { courseId, title } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ error: 'Invalid quiz data' });
    }

    const quizData = {
      courseId,
      title,
    };

    const newQuiz = await quizModel.createQuiz(quizData);
    return res.status(201).json({ data: newQuiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { quizId, question, sequence } = req.body;

    if (!quizId || !question || sequence === undefined) {
      return res.status(400).json({ error: 'Invalid question data' });
    }

    const questionData = {
      quizId,
      question,
      sequence,
    };

    const newQuestion = await quizModel.createQuestion(questionData);
    return res.status(201).json({ data: newQuestion });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createAnswer = async (req, res) => {
  try {
    const { questionId, answer, correct } = req.body;

    if (!questionId || !answer || correct === undefined) {
      return res.status(400).json({ error: 'Invalid answer data' });
    }

    const answerData = {
      questionId,
      answer,
      correct,
    };

    const newAnswer = await quizModel.createAnswer(answerData);
    return res.status(201).json({ data: newAnswer });
  } catch (error) {
    console.error('Error creating answer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getQuizAttemptById = async (req, res) => {
  try {
    const attemptId = parseInt(req.params.attemptId, 10);
    const attempt = await quizModel.getQuizAttemptById(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }

    return res.status(200).json({ data: attempt });
  } catch (error) {
    console.error('Error fetching quiz attempt by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getQuizAttemptsByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const attempts = await quizModel.getQuizAttemptsByUserId(userId);

    return res.status(200).json({ data: attempts });
  } catch (error) {
    console.error('Error fetching quiz attempts by user ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const accpetEnrollmentRequest = async (req, res) => {
  try {
    const enrollmentId = parseInt(req.params.enrollmentId, 10);
    const updatedEnrollment =
      await courseModel.accpetEnrollmentRequest(enrollmentId);
      const userId = updatedEnrollment.userId;
      const fcmToken = await userModel.getFcmTokenByUserId(userId);
      const course = await courseModel.getCourseById(updatedEnrollment.courseId);
      if (fcmToken) {
        const message = {
          notification: {
            title: 'Enrollment Approved',
            body: `Your enrollment request for course ${course.title} has been approved.`,
          },
          data: {
            route: `/course/${course.id}`,
            type:'enrollment_confirmation',
            course_id: course.id.toString(),
          },
          token: fcmToken,
        };
        await getMessaging().send(message);
      }
    res.status(200).json(updatedEnrollment);
  } catch (error) {
    console.error('Error accepting enrollment request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const rejectEnrollmentRequest = async (req, res) => {
  try {
    const enrollmentId = parseInt(req.params.enrollmentId, 10);
    const updatedEnrollment =
      await courseModel.rejectEnrollmentRequest(enrollmentId);
    res.status(200).json(updatedEnrollment);
  } catch (error) {
    console.error('Error rejecting enrollment request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteQuestionById = async (req, res) => {
  try {
    const questionId = parseInt(req.params.questionId, 10);
    const deletedQuestion = await courseModel.deleteQuestionById(questionId);
    res.status(200).json(deletedQuestion);
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAnswerById = async (req, res) => {
  try {
    const answerId = parseInt(req.params.answerId, 10);
    const deletedAnswer = await courseModel.deleteAnswerById(answerId);
    res.status(200).json(deletedAnswer);
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  getAllCourses,
  getAllLessons,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  sendNotification,
  getFcmTokenByUserId,
  getAllFcmTokens,
  getQuizByCourseId,
  createQuiz,
  createQuestion,
  createAnswer,
  getQuizAttemptById,
  getQuizAttemptsByUserId,
  accpetEnrollmentRequest,
  rejectEnrollmentRequest,
  deleteQuestionById,
  deleteAnswerById,
};
