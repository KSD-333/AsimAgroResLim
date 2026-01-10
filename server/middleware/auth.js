const { admin, db } = require('../config/firebase');

// Authenticate user via Firebase token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    // Get or create user in Firestore
    const userRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const newUser = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0],
        role: 'user',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        preferences: {
          newsletter: false,
          notifications: true
        }
      };
      await userRef.set(newUser);
      req.dbUser = { id: decodedToken.uid, ...newUser };
    } else {
      // Update last login
      await userRef.update({ 
        lastLogin: admin.firestore.FieldValue.serverTimestamp() 
      });
      req.dbUser = { id: userDoc.id, ...userDoc.data() };
    }

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
