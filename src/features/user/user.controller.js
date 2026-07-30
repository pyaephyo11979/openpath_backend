const userModel = require('#models/user.model.js');
const userSchema = require('#schemas/user.schema.js');

const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updatedData = req.body;
    userSchema.validate(updatedData, { abortEarly: false });
    const updatedUser = await userModel.updateUser(userId, updatedData);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.userId;
    await userModel.deleteUser(userId);
    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateFcmToken = async (req, res) => {
  try {
    const userId = req.userId;
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }
    await userModel.updateFcmTokenByUserId(userId, fcmToken);
    res.status(200).json({ message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  updateFcmToken,
};
