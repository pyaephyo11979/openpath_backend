require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('#utils/firebase.js');

const authRoutes = require('#features/authentication/auth.route.js');
const courseRoutes = require('#features/courses/course.route.js');
const lessonRoutes = require('#features/lessons/lesson.route.js');
const adminRoutes = require('#features/admin/admin.route.js');
const userRoutes = require('#features/user/user.route.js');
const quizRoutes = require('#features/quizzes/quiz.route.js');

const { sentReminderNoti } = require('#utils/cronJob.js');

const app = express();

const port = process.env.PORT;

app.use(
  cors({
    origin: [process.env.CONSOLE_DEV_URL],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quizzes', quizRoutes);

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  }
  sentReminderNoti.start();
  console.log(`Server is running on port ${port}`);
});
