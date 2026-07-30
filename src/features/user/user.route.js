const userController = require('./user.controller');
const express = require('express');
const router = express.Router();
const { checkAuth } = require('#middlewares/auth.middleware.js');

router.get('/profile', checkAuth, userController.getProfile);
router.put('/profile', checkAuth, userController.updateProfile);
router.delete('/profile', checkAuth, userController.deleteProfile);
router.put('/fcm-token', checkAuth, userController.updateFcmToken);

module.exports = router;
