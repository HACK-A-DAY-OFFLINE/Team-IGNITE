import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mothersAPI, Mother } from '../lib/api';
import { SingleCallModal } from '../components/SingleCallModal';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Heart
} from 'lucide-react';

export function MotherProfile() {
  const { asha } = useAuth();
  const [mother, setMother] = useState<Mother | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const motherId = pathParts[pathParts.length - 1];
    loadMother(motherId);
  }, []);

  const loadMother = async (motherId: string) => {
    try {
      const data = await mothersAPI.getById(motherId);
      setMother(data);
    } catch (error) {
      console.error('Error loading mother:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async () => {
    if (!mother) return;

    try {
      const updated = await mothersAPI.update(mother.id, { flagged: !mother.flagged });
      setMother(updated);
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  const markVisited = async () => {
    if (!mother) return;

    try {
      const updated = await mothersAPI.update(mother.id, { visited: true, flagged: false });
      setMother(updated);
    } catch (error) {
      console.error('Error marking as visited:', error);
    }
  };

  const handleCallComplete = async (result: 'answered' | 'pressed_2') => {
    if (!mother || !asha) return;

    try {
      if (result === 'pressed_2') {
        const updated = await mothersAPI.update(mother.id, { flagged: true });
        setMother(updated);
      }
      setShowCallModal(false);
    } catch (error) {
      console.error('Error handling call complete:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></span>
            <span className="w-3 h-3 bg-rose-400 rounded-full animate-bounce delay-75"></span>
            <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-150"></span>
          </div>
          <p className="text-pink-400 font-medium animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!mother) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-pink-600 font-medium">Mother not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <header className="bg-white/70 backdrop-blur-md border-b border-white/50 relative z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="group flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors mb-2"
          >
            <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Mother Profile</h1>
            <Heart className="w-5 h-5 text-pink-400 fill-pink-100" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl hover:shadow-pink-100 duration-500">
          {/* Card Header Gradient */}
          <div className="bg-gradient-to-r from-pink-400 via-rose-400 to-rose-500 px-8 py-10 relative overflow-hidden">
            {/* Decorative circles in header */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-5">
                <div className="bg-white/90 p-4 rounded-full shadow-lg border-4 border-pink-200/50">
                  <User className="w-12 h-12 text-pink-500" />
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-bold tracking-tight">{mother.name}</h2>
                  <p className="text-pink-50 font-medium mt-1 flex items-center gap-2">
                    <span>Age: {mother.age} years</span>
                  </p>
                </div>
              </div>
              {mother.flagged && (
                <span className="bg-white/90 backdrop-blur text-rose-500 text-sm font-bold px-4 py-2 rounded-xl shadow-lg animate-pulse flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  FLAGGED
                </span>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-pink-50/50 hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-100">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-pink-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Phone</p>
                    <p className="font-semibold text-gray-700 text-lg">{mother.phone}</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-pink-50/50 hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-100">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-pink-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Address</p>
                    <p className="font-semibold text-gray-700">{mother.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-purple-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Last ANC Date</p>
                    <p className="font-semibold text-gray-700 text-lg">
                      {formatDate(mother.last_anc_date)}
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-purple-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Gestation</p>
                    <p className="font-semibold text-gray-700 text-lg">
                      Week {mother.gestation_weeks}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-pink-100 pt-6">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="mt-1">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Notes</p>
                  <p className="text-gray-700 italic leading-relaxed">
                    "{mother.notes || 'No notes available'}"
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white border border-pink-100 p-4 rounded-xl shadow-sm w-fit">
              <CheckCircle
                className={`w-6 h-6 ${
                  mother.visited ? 'text-green-500' : 'text-gray-300'
                }`}
              />
              <span className="font-medium text-gray-700">
                {mother.visited ? 'Recently Visited' : 'Not Yet Visited'}
              </span>
            </div>

            <div className="border-t border-pink-100 pt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowCallModal(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-500/30 transform transition-all hover:-translate-y-1"
              >
                <Phone className="w-5 h-5" />
                <span>Call Mother</span>
              </button>

              <button
                onClick={markVisited}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-purple-100 hover:border-purple-300 text-purple-600 hover:bg-purple-50 font-bold py-4 rounded-2xl transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Mark as Visited</span>
              </button>

              <button
                onClick={toggleFlag}
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all ${
                  mother.flagged
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    : 'bg-white border-2 border-rose-100 hover:border-rose-300 text-rose-500 hover:bg-rose-50'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                <span>{mother.flagged ? 'Unflag' : 'Flag Issue'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {showCallModal && (
        <SingleCallModal
          motherName={mother.name}
          motherPhone={mother.phone}
          onComplete={handleCallComplete}
          onClose={() => setShowCallModal(false)}
        />
      )}

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
      `}</style>
    </div>
  );
}
