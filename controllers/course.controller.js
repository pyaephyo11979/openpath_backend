const courseModel = require('../models/course.model');
const upload = require('../middlewares/upload.middleware');
const path = require('path');
const fs = require('fs');

const getCourses = async (req, res) => {
  try {
    const courses = await courseModel.getCourses();
    res
      .status(200)
      .json({ message: 'Courses fetched successfully', data: courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseModel.getCourseById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res
      .status(200)
      .json({ message: 'Course fetched successfully', data: course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = path.join('uploads', file.filename);
    const courseData = {
      title: title,
      description: description,
      coverImage: filePath,
    };
    const newCourse = await courseModel.createCourse(courseData);
    res
      .status(201)
      .json({ message: 'Course created successfully', data: newCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const file = req.file;
    const course = await courseModel.getCourseById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (file) {
      // Delete the old cover image file if it exists
      if (course.coverImage) {
        const oldFilePath = path.join(__dirname, '..', course.coverImage);
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error('Error deleting old cover image:', err);
          }
        });
      }
      const newFilePath = path.join('uploads', file.filename);
      course.coverImage = newFilePath;
    }
    const updatedCourseData = {
      title: title || course.title,
      description: description || course.description,
      coverImage: course.coverImage,
    };
    const updatedCourse = await courseModel.updateCourse(id, updatedCourseData);
    res
      .status(200)
      .json({ message: 'Course updated successfully', data: updatedCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await courseModel.deleteCourse(id);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
