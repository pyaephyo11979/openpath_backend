const authController = require('./auth.controller');

const { checkAuth } = require('#middlewares/auth.middleware.js');
const express = require('express');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', checkAuth, authController.logout);

module.exports = router;
