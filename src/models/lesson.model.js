const prisma = require('#utils/prisma.js');

const createLesson = async (lessonData) => {
  try {
    const lesson = await prisma.lessons.create({
      data: lessonData,
    });
    return lesson;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

const getLessons = async () => {
  try {
    const lessons = await prisma.lessons.findMany({
      include: {
        course: true,
        progress: true,
      },
      orderBy: {
        sequence: 'asc',
      },
    });
    return lessons;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

const getLessonsByCourseId = async (courseId) => {
  try {
    const lessons = await prisma.lessons.findMany({
      where: { courseId },
      include: {
        course: true,
        progress: true,
      },
    });
    return lessons;
  } catch (error) {
    console.error('Error fetching lessons by course ID:', error);
    throw error;
  }
};

const getLessonById = async (id) => {
  try {
    const lesson = await prisma.lessons.findUnique({
      where: { id },
      include: {
        course: true,
        progress: true,
      },
    });
    return lesson;
  } catch (error) {
    console.error('Error fetching lesson by ID:', error);
    throw error;
  }
};

const updateLesson = async (id, lessonData) => {
  try {
    const lesson = await prisma.lessons.update({
      where: { id },
      data: lessonData,
    });
    return lesson;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

const deleteLesson = async (id) => {
  try {
    const lesson = await prisma.lessons.delete({
      where: { id },
    });
    return lesson;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

const updateLessonTrack = async (id, lessonTrackData) => {
  try {
    const lessonTrack = await prisma.lessonProgress.update({
      where: { id },
      data: lessonTrackData,
    });
    return lessonTrack;
  } catch (error) {
    console.error('Error updating lesson track:', error);
    throw error;
  }
};

const completeLessonTrack = async (userId, lessonId) => {
  try {
    const isExisting = await prisma.lessonProgress.findFirst({
      where: { userId, lessonId },
    });
    if (!isExisting) {
      const newLessonTrack = await prisma.lessonProgress.create({
        data: { userId, lessonId, completed: true },
      });
      return newLessonTrack;
    }
    const lessonTrack = await prisma.lessonProgress.update({
      where: { userId_lessonId: { userId, lessonId } },
      data: { completed: true },
    });
    return lessonTrack;
  } catch (error) {
    console.error('Error completing lesson track:', error);
    throw error;
  }
};

const createLessonTrack = async (lessonTrackData) => {
  try {
    const lessonTrack = await prisma.lessonProgress.create({
      data: lessonTrackData,
    });
    return lessonTrack;
  } catch (error) {
    console.error('Error creating lesson track:', error);
    throw error;
  }
};

const isLessonCompletedByUser = async (userId, lessonId) => {
  try {
    const lessonTrack = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    return lessonTrack ? lessonTrack.completed : false;
  } catch (error) {
    console.error('Error checking if lesson is completed by user:', error);
    throw error;
  }
};

module.exports = {
  createLesson,
  getLessons,
  getLessonsByCourseId,
  getLessonById,
  updateLesson,
  deleteLesson,
  updateLessonTrack,
  completeLessonTrack,
  createLessonTrack,
  isLessonCompletedByUser,
};
