const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./ray-production-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = '9dTLpO8BJ7RwtOfxW6OxDBOMxnz1';

admin.auth().setCustomUserClaims(uid, { role: 'admin' })
  .then(() => {
    console.log('✅ Admin role successfully set for UID:', uid);
    console.log('The user can now log in to the admin dashboard.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error setting admin role:', error);
    process.exit(1);
  });
