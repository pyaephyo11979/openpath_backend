const authController = require('../controllers/auth.controller');
const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth.middleware');

router.post('/register', authController.createUser);
router.post('/login', authController.loginUser);
router.post('/refresh', authController.refresh);
router.post('/logout', checkAuth, authController.logoutUser);

module.exports = router;