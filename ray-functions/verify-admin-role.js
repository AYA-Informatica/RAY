const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('../ray-production-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = '9dTLpO8BJ7RwtOfxW6OxDBOMxnz1';

async function verifyAdminRole() {
  try {
    const user = await admin.auth().getUser(uid);
    console.log('\n✅ User found:', user.email);
    console.log('📋 Custom claims:', user.customClaims);
    
    if (user.customClaims?.role === 'admin') {
      console.log('\n✅ Admin role is correctly set!');
      console.log('\n⚠️  IMPORTANT: The user must log out and log back in for the new role to take effect.');
      console.log('   Firebase tokens are cached and need to be refreshed.\n');
      console.log('Steps to fix:');
      console.log('1. Log out from the admin dashboard');
      console.log('2. Clear browser cache/cookies (or use incognito mode)');
      console.log('3. Log back in with the same credentials\n');
    } else {
      console.log('\n❌ Admin role is NOT set. Current role:', user.customClaims?.role || 'none');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyAdminRole();
