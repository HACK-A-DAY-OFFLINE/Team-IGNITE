import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, Heart } from 'lucide-react';

export function Login() {
  const [ashaId, setAshaId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(ashaId, password);

    if (success) {
      window.location.href = '/dashboard';
    } else {
      setError('Invalid ASHA ID or password');
    }

    setLoading(false);
  };

  return (
    // Main Container with Pink Gradient and Floating "Blobs"
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Background Blobs (Animation via CSS below) */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-32 h-32 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Glassmorphism Card */}
      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 transform transition-all hover:scale-[1.01] duration-500">
        
        {/* Icon Header */}
        <div className="flex justify-center mb-6 relative">
          <div className="bg-gradient-to-tr from-pink-200 to-rose-100 p-4 rounded-full shadow-inner relative group">
            <UserCircle className="w-12 h-12 text-pink-600 group-hover:scale-110 transition-transform duration-300" />
            {/* Cute little heart badge */}
            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm">
               <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2 tracking-tight">
          Kannamma <span className="text-pink-600">ASHA</span>
        </h1>
        <p className="text-center text-gray-500 mb-8 font-medium">
          Welcome back, sister! 💕
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label htmlFor="ashaId" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              ASHA ID
            </label>
            <input
              type="text"
              id="ashaId"
              value={ashaId}
              onChange={(e) => setAshaId(e.target.value)}
              className="w-full px-5 py-3 border border-pink-200 rounded-2xl bg-pink-50/50 focus:bg-white focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 outline-none placeholder-pink-300 text-gray-700"
              placeholder="Enter your ASHA ID"
              required
            />
          </div>

          <div className="group">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border border-pink-200 rounded-2xl bg-pink-50/50 focus:bg-white focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 outline-none placeholder-pink-300 text-gray-700"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center animate-shake">
              <span className="mr-2">⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-pink-500/30 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 p-5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
          <p className="text-xs text-pink-600 font-bold mb-2 uppercase tracking-wider">Demo Access:</p>
          <div className="flex flex-col gap-1">
             <p className="text-xs text-gray-600 flex justify-between">
                <span>ASHA ID:</span> <span className="font-mono bg-white px-2 py-0.5 rounded border border-pink-100">ASHA001</span>
             </p>
             <p className="text-xs text-gray-600 flex justify-between">
                <span>Password:</span> <span className="font-mono bg-white px-2 py-0.5 rounded border border-pink-100">password123</span>
             </p>
          </div>
        </div>
      </div>

      {/* Custom Styles for specific animations usually found in tailwind.config.js */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}