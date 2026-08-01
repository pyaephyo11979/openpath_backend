require('dotenv').config();
const { initializeApp } = require('firebase-admin/app');
const { cert } = require('firebase-admin/app');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = initializeApp({
  credential: cert(serviceAccount),
});

module.exports = app;
