import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from '../lib/firebase';
import { AppLogo } from './AppLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSignOutSuccess?: () => void;
  onAuthSuccess?: (user: User) => void;
  onOpenStyleProfile?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignOutSuccess,
  onAuthSuccess,
  onOpenStyleProfile,
}) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setSuccessMessage('Successfully signed in with Google!');
      setTimeout(() => {
        onClose();
        if (onAuthSuccess && result.user) {
          onAuthSuccess(result.user);
        }
      }, 700);
    } catch (err: any) {
      const code = err?.code;
      const message = typeof err?.message === 'string' ? err.message : '';
      const isUserClosed =
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        message.includes('popup-closed-by-user') ||
        message.includes('cancelled-popup-request');

      if (isUserClosed) {
        // Normal user cancellation - do not treat as an unhandled console error
        setErrorMessage('Google sign-in was canceled. You can try again, continue offline, or use Email sign in below.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('Pop-up window was blocked by your browser. Please enable popups or use Email sign in below.');
      } else {
        console.warn('Google sign-in notice:', message || code);
        setErrorMessage(message || 'Google sign-in encountered an issue. You can sign in with Email & Password below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    if (authMode === 'signup' && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let authUser: User | null = null;
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(userCredential.user, {
            displayName: displayName.trim(),
          });
        }
        authUser = userCredential.user;
        setSuccessMessage('Account created and synced!');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        authUser = userCredential.user;
        setSuccessMessage('Signed in successfully!');
      }
      setTimeout(() => {
        onClose();
        if (onAuthSuccess && authUser) {
          onAuthSuccess(authUser);
        }
      }, 700);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMessage('Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('Account exists with this email. Switch to sign in.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        console.warn('Email auth notice:', err?.message || code);
        setErrorMessage(err?.message || 'Authentication error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      if (onSignOutSuccess) onSignOutSuccess();
      onClose();
    } catch (err: any) {
      console.warn('Sign out notice:', err?.message);
      setErrorMessage('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-scale-up">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Simplified Header */}
        <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-2">
            <AppLogo variant="icon-only" size="sm" />
            <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase">
              Kloset - Your smart virtual wardrobe
            </span>
          </div>

          <h2
            className="text-xl sm:text-2xl font-serif font-bold text-amber-50"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {currentUser ? 'Your Kloset Account' : 'Sign in to Kloset'}
          </h2>
          <p className="text-xs text-stone-300 mt-1 leading-relaxed">
            {currentUser
              ? 'Your Kloset is automatically backed up and synced live across your devices.'
              : 'Sign in to access your clothes, outfits, and packing lists on your phone, tablet, and computer.'}
          </p>

          {/* Device Sync Badges */}
          <div className="flex items-center gap-3.5 mt-4 pt-3 border-t border-white/10 text-[11px] text-stone-300">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-300" /> <span>Phone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tablet className="w-3.5 h-3.5 text-amber-300" /> <span>Tablet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-amber-300" /> <span>Laptop</span>
            </div>
            <div className="ml-auto flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> <span>Real-time</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-800/20"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#FAF0EB] text-[#39402D] border border-[#ECDACF] flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5 text-[#39402D]" />
                  </div>
                )}
                <div className="text-xs min-w-0 flex-1">
                  <p className="font-bold text-stone-900 truncate">
                    {currentUser.displayName || 'User Account'}
                  </p>
                  <p className="text-stone-500 truncate text-[11px]">
                    {currentUser.email}
                  </p>
                  <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px] mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active & Syncing</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {onOpenStyleProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenStyleProfile();
                    }}
                    className="w-full py-3 bg-[#39402D] hover:bg-[#485339] text-[#F0CAAF] font-bold rounded-2xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2 border border-[#C89452] cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C89452]" />
                    <span>Edit Styling Persona & Preferred Name</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-2xl text-xs transition-colors border border-stone-200 cursor-pointer"
                >
                  Return to Wardrobe
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-semibold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-stone-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Not logged in: Clean One-Click Google Focus */
            <div className="space-y-4">
              {/* Notifications */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Primary 1-Click Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm rounded-2xl border-2 border-stone-200 hover:border-amber-800/40 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 active:scale-98 cursor-pointer"
              >
                {/* Official Google Color G */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>

              {/* Optional Email & Password Accordion */}
              <div className="pt-2">
                {!showEmailForm ? (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(true)}
                      className="text-xs text-stone-500 hover:text-stone-800 underline transition-colors"
                    >
                      Or sign in with email address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                        {authMode === 'signup' ? 'Create Email Account' : 'Sign in with Email'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="text-[11px] text-stone-400 hover:text-stone-600"
                      >
                        Hide
                      </button>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-2.5">
                      {authMode === 'signup' && (
                        <div>
                          <div className="relative">
                            <UserIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              placeholder="Your Name"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-800 focus:bg-white"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                          <input
                            type="email"
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-800 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                          <input
                            type="password"
                            required
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-800 focus:bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-stone-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition-all shadow-xs"
                      >
                        {loading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                      </button>
                    </form>

                    <div className="text-center pt-1">
                      {authMode === 'signin' ? (
                        <p className="text-[11px] text-stone-500">
                          Need an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('signup');
                              setErrorMessage('');
                            }}
                            className="font-bold text-amber-900 hover:underline"
                          >
                            Sign up
                          </button>
                        </p>
                      ) : (
                        <p className="text-[11px] text-stone-500">
                          Have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('signin');
                              setErrorMessage('');
                            }}
                            className="font-bold text-amber-900 hover:underline"
                          >
                            Sign in
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Seamless Continue Offline Button */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold rounded-xl text-xs transition-colors border border-stone-200 cursor-pointer text-center"
                >
                  Continue as Guest (Use Offline Closet)
                </button>
                <p className="text-[10px] text-stone-400 text-center leading-relaxed">
                  Your wardrobe is always stored safely on your device. Sign in anytime to sync to the cloud.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
