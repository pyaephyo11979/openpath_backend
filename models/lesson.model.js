const prisma = require('../utils/prisma');

const getLessons = async (courseId) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: courseId,
      },
    });
    return lessons;
  } catch (error) {
    throw new Error('Error fetching lessons: ' + error.message);
  }
};

const createLesson = async (lessonData) => {
  try {
    const lesson = await prisma.lesson.create({
      data: lessonData,
    });
    return lesson;
  } catch (error) {
    throw new Error('Error creating lesson: ' + error.message);
  }
};

const getLessonById = async (id) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });
    return lesson;
  } catch (error) {
    throw new Error('Error fetching lesson by ID: ' + error.message);
  }
};

const updateLesson = async (id, lessonData) => {
  try {
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: lessonData,
    });
    return updatedLesson;
  } catch (error) {
    throw new Error('Error updating lesson: ' + error.message);
  }
};

const deleteLesson = async (id) => {
  try {
    const deletedLesson = await prisma.lesson.delete({
      where: { id },
    });
    return deletedLesson;
  } catch (error) {
    throw new Error('Error deleting lesson: ' + error.message);
  }
};

module.exports = {
  getLessons,
  createLesson,
  getLessonById,
  updateLesson,
  deleteLesson,
};
