const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    // Only initialize if credentials are provided
    if (config.projectId && config.privateKey && config.clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert(config),
      });
      console.log('✅ Firebase Admin initialized');
    } else {
      console.warn('⚠️  Firebase Admin credentials not found. Auth middleware will be disabled.');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
  }
}

const User = require('../models/User');

// Authenticate user via Firebase token
const authenticateUser = async (req, res, next) => {
  try {
    // Skip auth if Firebase Admin is not initialized (development mode)
    if (!admin.apps.length) {
      console.warn('⚠️  Auth middleware skipped - Firebase Admin not initialized');
      req.user = { uid: 'dev-user', email: 'dev@example.com' };
      req.dbUser = { _id: 'dev-user-id', role: 'admin' };
      return next();
    }

    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    // Get or create user in MongoDB
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0],
      });
    }

    req.dbUser = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.dbUser) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.dbUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { authenticateUser, isAdmin };
