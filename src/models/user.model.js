const prisma = require('#utils/prisma.js');

const createUser = async (userData) => {
  try {
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }
    const user = await prisma.users.create({
      data: userData,
    });
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

const getUsers = async () => {
  try {
    const users = await prisma.users.findMany({
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

const updateUser = async (id, userData) => {
  try {
    const updatedUser = await prisma.users.update({
      where: { id },
      data: userData,
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const deletedUser = await prisma.users.delete({
      where: { id },
    });
    return deletedUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

const getFcmTokenByUserId = async (userId) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });
    return user ? user.fcmToken : null;
  } catch (error) {
    console.error('Error fetching FCM token by user ID:', error);
    throw error;
  }
};

const updateFcmTokenByUserId = async (userId, fcmToken) => {
  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { fcmToken },
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating FCM token by user ID:', error);
    throw error;
  }
};

const clearFcmToken = async (token) => {
  try {
    await prisma.users.updateMany({
      where: { fcmToken: token },
      data: { fcmToken: null },
    });
  } catch (error) {
    console.error('Error clearing FCM token:', error);
    throw error;
  }
};

const getFcmTokens = async () => {
  try {
    const users = await prisma.users.findMany({
      select: { id: true, email: true, fcmToken: true },
    });
    return users.map((user) => user.fcmToken);
  } catch (error) {
    console.error('Error fetching FCM tokens:', error);
    throw error;
  }
};

const updateFcmToken = async (userId, fcmToken) => {
  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { fcmToken },
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getFcmTokenByUserId,
  updateFcmTokenByUserId,
  clearFcmToken,
  getFcmTokens,
  updateFcmToken,
};
