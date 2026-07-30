const prisma = require('#utils/prisma.js');

const getCourses = async () => {
  try {
    const courses = await prisma.courses.findMany({
      include: {
        lessons: true,
        enrollments: {
          include: {
            user: true,
          },
        },
      },
    });
    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

const searchCourseByTitle = async (title) => {
  try {
    const courses = await prisma.courses.findMany({
      where: {
        title: {
          contains: title,
        },
      },
    });
    return courses;
  } catch (error) {
    console.error('Error searching courses by title:', error);
    throw error;
  }
};

const getCourseById = async (id) => {
  try {
    const course = await prisma.courses.findUnique({
      where: { id },
      include: {
        lessons: true,
        enrollments: {
          include: {
            user: true,
          },
        },
        quizzes: true,
      },
    });
    return course;
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    throw error;
  }
};

const createCourse = async (courseData) => {
  try {
    const course = await prisma.courses.create({
      data: courseData,
    });
    return course;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

const updateCourse = async (id, courseData) => {
  try {
    const course = await prisma.courses.update({
      where: { id },
      data: courseData,
    });
    return course;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

const deleteCourse = async (id) => {
  try {
    const course = await prisma.courses.delete({
      where: { id },
    });
    return course;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

const enrollInCourse = async (userId, courseId) => {
  try {
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });
    if (existingEnrollment) {
      throw new Error('User is already enrolled in this course');
    }
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });
    return enrollment;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

const getEnrollmentsByUserId = async (userId) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, approved: true },
      include: {
        course: true,
      },
    });
    for (const enrollment of enrollments) {
      const course = await prisma.courses.findUnique({
        where: { id: enrollment.courseId },
        include: {
          lessons: true,
        },
      });
      enrollment.course = course;
      enrollment.course.status = await getCourseStatusByCouseId(
        enrollment.courseId
      );
      let isEnrolled = await isUserEnrolledInCourse(
        userId,
        enrollment.course.id
      );
      enrollment.course.isEnrolled = isEnrolled;
    }
    return enrollments;
  } catch (error) {
    console.error('Error fetching enrollments by user ID:', error);
    throw error;
  }
};

const getCourseStatusByCouseId = async (courseId) => {
  try {
    let isFinished = false;
    const lessons = await prisma.lessons.findMany({
      where: { courseId: courseId },
      include: {
        progress: true,
      },
    });
    lessons.forEach((lesson) => {
      if (lesson.progress.at(0)?.completed) {
        isFinished = true;
      } else {
        isFinished = false;
      }
    });
    if (lessons.length === 0) {
      return 'no lessons';
    }
    return isFinished ? 'finished' : 'in progress';
  } catch (error) {
    console.error('Error fetching course status:', error);
    throw error;
  }
};

const getEnrollmentsByCourseId = async (courseId) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: true,
      },
    });
    return enrollments;
  } catch (error) {
    console.error('Error fetching enrollments by course ID:', error);
    throw error;
  }
};
const isUserEnrolledInCourse = async (userId, courseId) => {
  try {
    let isEnrolled = false;
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });
    if (enrollment) {
      isEnrolled = true;
    }
    return isEnrolled;
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    throw error;
  }
};

const accpetEnrollmentRequest = async (enrollmentId) => {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { approved: true, status: 'APPROVED' },
    });
    return enrollment;
  } catch (error) {
    console.error('Error accepting enrollment request:', error);
    throw error;
  }
};

const rejectEnrollmentRequest = async (enrollmentId) => {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { approved: false, status: 'REJECTED' },
    });
    return enrollment;
  } catch (error) {
    console.error('Error rejecting enrollment request:', error);
    throw error;
  }
};

const deleteQuestionById = async (questionId) => {
  try {
    const answers = await prisma.answers.findMany({
      where: { questionId },
      select: { id: true },
    });
    const answerIds = answers.map((a) => a.id);
    await prisma.userQuizAnswer.deleteMany({
      where: { answerId: { in: answerIds } },
    });
    await prisma.answers.deleteMany({
      where: { questionId },
    });
    const deletedQuestion = await prisma.questions.delete({
      where: { id: questionId },
    });
    return deletedQuestion;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

const deleteAnswerById = async (answerId) => {
  try {
    await prisma.userQuizAnswer.deleteMany({
      where: { answerId },
    });
    const deletedAnswer = await prisma.answers.delete({
      where: { id: answerId },
    });
    return deletedAnswer;
  } catch (error) {
    console.error('Error deleting answer:', error);
    throw error;
  }
};

const getTrendingCourses = async () => {
  try {
    const courses = await prisma.courses.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        lessons: true,
        enrollments: {
          include: {
            user: true,
          },
        },
        quizzes: true,
      },
    });
    return courses;
  } catch (error) {
    console.error('Error fetching trending courses:', error);
    throw error;
  }
};

const getEnrollmentStatusByUserIdAndCourseId = async (userId, courseId) => {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });
    if (!enrollment) {
      return 'not enrolled';
    }
    return enrollment.status;
  } catch (error) {
    console.error('Error fetching enrollment status:', error);
    throw error;
  }
};
module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrollmentsByUserId,
  getEnrollmentsByCourseId,
  isUserEnrolledInCourse,
  getCourseStatusByCouseId,
  accpetEnrollmentRequest,
  rejectEnrollmentRequest,
  deleteQuestionById,
  deleteAnswerById,
  getTrendingCourses,
  getEnrollmentStatusByUserIdAndCourseId,
  searchCourseByTitle,
};
