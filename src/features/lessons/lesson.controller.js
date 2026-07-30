const lessonModel = require('#models/lesson.model.js');

const getAllLessonsByCourseId = async (req, res) => {
  const { courseId } = req.params;
  try {
    const lessons = await lessonModel.getLessonsByCourseId(courseId);
    lessons.forEach((lesson) => {
      isCompleted = lessonModel.isLessonCompletedByUser(req.userId, lesson.id);
      lesson.isCompleted = isCompleted;
    });
    res
      .status(200)
      .json({ message: 'Lessons fetched successfully', data: lessons });
  } catch (err) {
    console.error('Error fetching lessons by course ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLessonById = async (req, res) => {
  const { id } = req.params;
  let isCompleted = false;
  try {
    const lesson = await lessonModel.getLessonById(parseInt(id));
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    isCompleted = await lessonModel.isLessonCompletedByUser(
      req.userId,
      lesson.id
    );
    lesson.isCompleted = isCompleted;
    res
      .status(200)
      .json({ message: 'Lesson fetched successfully', data: lesson });
  } catch (err) {
    console.error('Error fetching lesson by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const completeLesson = async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.userId;
  try {
    const completion = await lessonModel.completeLessonTrack(
      userId,
      parseInt(lessonId)
    );
    res
      .status(200)
      .json({ message: 'Lesson completed successfully', data: completion });
  } catch (err) {
    console.error('Error completing lesson:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createLessonTrack = async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.userId;

  try {
    const lessonTrackData = {
      userId,
      lessonId,
      completed: false,
    };
    const lessonTrack = await lessonModel.createLessonTrack(lessonTrackData);
    res.status(201).json({
      message: 'Lesson track created successfully',
      data: lessonTrack,
    });
  } catch (err) {
    console.error('Error creating lesson track:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateLessonTrack = async (req, res) => {
  const { lessonTrackId } = req.params;
  const lessonTrackData = req.body;

  try {
    const updatedLessonTrack = await lessonModel.updateLessonTrack(
      lessonTrackId,
      lessonTrackData
    );
    res.status(200).json({
      message: 'Lesson track updated successfully',
      data: updatedLessonTrack,
    });
  } catch (err) {
    console.error('Error updating lesson track:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllLessonsByCourseId,
  getLessonById,
  completeLesson,
  createLessonTrack,
  updateLessonTrack,
};
