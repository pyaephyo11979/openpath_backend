const prisma = require('../utils/prisma');

const getCourses = async () => {
  try {
    const courses = await prisma.course.findMany(
       {
        enrollments: {
            include: {
            user: true,
          },
        }
       }
    );
    return courses;
  } catch (error) {
    throw new Error('Error fetching courses: ' + error.message);
  }
};

const createCourse = async (courseData) => {
  try {
    const course = await prisma.course.create({
      data: courseData,
    });
    return course;
  } catch (error) {
    throw new Error('Error creating course: ' + error.message);
  }
};

const getCourseById = async (id) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
    });
    return course;
  } catch (error) {
    throw new Error('Error fetching course by ID: ' + error.message);
  }
};

const updateCourse = async (id, courseData) => {
  try {
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: courseData,
    });
    return updatedCourse;
  } catch (error) {
    throw new Error('Error updating course: ' + error.message);
  }
};

const deleteCourse = async (id) => {
  try {
    const deletedCourse = await prisma.course.delete({
      where: { id },
    });
    return deletedCourse;
  } catch (error) {
    throw new Error('Error deleting course: ' + error.message);
  }
};

module.exports = {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
};
