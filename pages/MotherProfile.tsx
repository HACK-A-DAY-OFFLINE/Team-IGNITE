import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mothersAPI, ivrAPI, Mother } from '../lib/api';
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
      // Call logs are automatically created by the backend when IVR calls are made
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!mother) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Mother not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Mother Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full">
                  <User className="w-10 h-10 text-teal-600" />
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-bold">{mother.name}</h2>
                  <p className="text-teal-100 mt-1">Age: {mother.age} years</p>
                </div>
              </div>
              {mother.flagged && (
                <span className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  FLAGGED
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-800">{mother.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-800">{mother.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Last ANC Date</p>
                    <p className="font-medium text-gray-800">{formatDate(mother.last_anc_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Gestation</p>
                    <p className="font-medium text-gray-800">Week {mother.gestation_weeks}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-5 h-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="text-gray-800">{mother.notes || 'No notes available'}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className={`w-5 h-5 ${mother.visited ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-medium text-gray-700">
                  {mother.visited ? 'Recently Visited' : 'Not Yet Visited'}
                </span>
              </div>
            </div>

            <div className="border-t pt-6 flex gap-3">
              <button
                onClick={() => setShowCallModal(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition"
              >
                <Phone className="w-5 h-5" />
                <span>Call Mother</span>
              </button>

              <button
                onClick={markVisited}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Mark as Visited</span>
              </button>

              <button
                onClick={toggleFlag}
                className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-lg transition ${
                  mother.flagged
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                <span>{mother.flagged ? 'Unflag' : 'Flag'}</span>
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
    </div>
  );
}
