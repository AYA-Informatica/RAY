// Script to set admin role for emulator testing
const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator } = require('firebase/auth');

// Initialize Firebase
const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY || 'fake-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'fake-domain',
  projectId: process.env.FIREBASE_PROJECT_ID || 'fake-project',
});

const auth = getAuth(app);
connectAuthEmulator(auth, 'http://localhost:9099');

// Set admin role
async function setAdminRole(email) {
  try {
    // Get user by email
    const { getUserByEmail } = require('firebase-admin/auth');
    const user = await getUserByEmail(email);
    
    // Set custom claims
    await auth.setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`✅ Admin role set for ${email} (UID: ${user.uid})`);
  } catch (error) {
    console.error('❌ Error setting admin role:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  const email = process.argv[2] || 'admin@test.com';
  setAdminRole(email);
}