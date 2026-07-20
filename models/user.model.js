const prisma = require('../utils/prisma');

const getUsers = async () => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    throw new Error('Error fetching users: ' + error.message);
  }
};

const createUser = async (userData) => {
  try {
    const user = await prisma.user.create({
      data: userData,
    });
    return user;
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    throw new Error('Error fetching user by email: ' + error.message);
  }
};

const getUserById = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    throw new Error('Error fetching user by ID: ' + error.message);
  }
};

const updateUser = async (id, userData) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: userData,
    });
    return updatedUser;
  } catch (error) {
    throw new Error('Error updating user: ' + error.message);
  }
};

const deleteUser = async (id) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    return deletedUser;
  } catch (error) {
    throw new Error('Error deleting user: ' + error.message);
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
};
