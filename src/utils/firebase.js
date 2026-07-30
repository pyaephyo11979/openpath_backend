const { initializeApp } = require('firebase-admin/app');
const { cert } = require('firebase-admin/app');
const serviceAccount = require('./serviceAccountKey.json');

const app = initializeApp({
  credential: cert(serviceAccount),
});

module.exports = app;
