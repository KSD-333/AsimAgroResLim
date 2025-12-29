import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the import path according to your structure
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Load saved credentials from localStorage
    const savedEmail = localStorage.getItem('userEmail');
    const savedPassword = localStorage.getItem('userPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      if (savedPassword) {
        setPassword(savedPassword);
      }
      setRememberMe(savedRememberMe);
    }
  }, []);

  const validatePassword = (password: string) => {
    // At least 8 chars, 1 upper, 1 lower, 1 number, 1 special
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin && !validatePassword(password)) {
        setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
        setLoading(false);
        return;
      }
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userPassword', password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userPassword');
          localStorage.removeItem('rememberMe');
        }
        // Store last login date
        localStorage.setItem('lastLoginDate', new Date().toISOString());
        // Check user role and redirect accordingly
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            const redirectPath = location.state?.from?.pathname || '/';
            navigate(redirectPath);
          }
        } else {
          const redirectPath = location.state?.from?.pathname || '/';
          navigate(redirectPath);
        }
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName,
          email,
          role: 'user',
          createdAt: new Date()
        });
        
        // Send verification email (optional, non-blocking)
        try {
          await sendEmailVerification(userCredential.user);
        } catch (verifyError) {
          console.warn('Email verification failed:', verifyError);
        }
        
        // Store signup and last login date
        localStorage.setItem('signupDate', new Date().toISOString());
        localStorage.setItem('lastLoginDate', new Date().toISOString());
        
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userPassword', password);
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Auto-login after registration - redirect to home
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPassword');
      localStorage.removeItem('rememberMe');
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setError('Verification email resent!');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError('Password reset email sent!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCheckVerification = async () => {
    setError('');
    setLoading(true);
    await auth.currentUser?.reload();
    if (auth.currentUser?.emailVerified) {
      setShowVerifyEmail(false);
      // Repeat the login redirect logic here
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          const redirectPath = location.state?.from?.pathname || '/';
          navigate(redirectPath);
        }
      } else {
        const redirectPath = location.state?.from?.pathname || '/';
        navigate(redirectPath);
      }
    } else {
      setError('Email is still not verified. Please check your inbox.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <Leaf className="h-8 w-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 ml-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={!isLogin}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              {isLogin && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <button type="button" onClick={handleForgotPassword} className="text-xs text-primary-600 hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>

            {showVerifyEmail && (
              <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
                Please verify your email address. Check your inbox for a verification link.
                <button onClick={handleResendVerification} className="ml-2 text-primary-600 underline">Resend Email</button>
                <button onClick={handleCheckVerification} className="ml-2 text-primary-600 underline">I have verified, check again</button>
              </div>
            )}

            {resetEmailSent && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                Password reset email sent! Check your inbox.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;