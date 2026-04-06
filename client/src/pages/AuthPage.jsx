import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import useAuthStore from '../store/authStore';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-400 to-emerald-600 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-4">Chat in real-time</h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Connect with friends and colleagues instantly. Share messages, images, and files — all in one place.
          </p>
          <div className="mt-10 space-y-4">
            {['End-to-end encrypted', 'Real-time typing indicators', 'Online presence', 'Media sharing'].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-emerald-50">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <AuthForm mode={mode} onToggle={() => setMode(mode === 'login' ? 'register' : 'login')} />
      </div>
    </div>
  );
};

export default AuthPage;
