import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mothersAPI, ivrAPI, Mother, CallLog } from '../lib/api';
import { PHCStockPanel } from '../components/PHCStockPanel';
import { MotherCard } from '../components/MotherCard';
import { FlaggedMothersList } from '../components/FlaggedMothersList';
import { CallLogsList } from '../components/CallLogsList';
import { CallAllModal } from '../components/CallAllModal';
import { LogOut, Phone, Download, Heart, Activity } from 'lucide-react';

export function Dashboard() {
  const { asha, logout } = useAuth();
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCallAll, setShowCallAll] = useState(false);

  // keep loadData stable (good for eslint rules)
  const loadData = useCallback(async () => {
    if (!asha) return;

    try {
      const [mothersData, logsData] = await Promise.all([
        mothersAPI.getAll(),
        ivrAPI.getCallLogs(),
      ]);

      setMothers(mothersData);
      setCallLogs(logsData.slice(0, 10));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [asha]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkVisited = async (motherId: string) => {
    try {
      await mothersAPI.update(motherId, { visited: true, flagged: false });
      await loadData();
    } catch (error) {
      console.error('Error marking as visited:', error);
    }
  };

  const handleCallAllComplete = async (
    results: Map<string, 'answered' | 'not_answered' | 'pressed_2'>
  ) => {
    if (!asha) return;

    try {
      const updatePromises: Promise<any>[] = [];
      for (const [motherId, result] of results.entries()) {
        if (result === 'not_answered' || result === 'pressed_2') {
          updatePromises.push(
            mothersAPI.update(motherId, { flagged: true })
          );
        }
      }

      await Promise.all(updatePromises);
      setShowCallAll(false);
      await loadData();
    } catch (error) {
      console.error('Error processing call results:', error);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Age',
      'Phone',
      'Address',
      'Last ANC Date',
      'Gestation Weeks',
      'Flagged',
      'Visited',
      'Notes',
    ];

    // simple CSV-safe cell formatter
    const escapeCSVCell = (value: unknown) => {
      const str = (value ?? '').toString();
      // escape quotes
      const escaped = str.replace(/"/g, '""');
      // wrap everything in quotes to be safe against commas/newlines
      return `"${escaped}"`;
    };

    const rows = mothers.map((m) => [
      m.name,
      m.age,
      m.phone,
      m.address,
      m.last_anc_date,
      m.gestation_weeks,
      m.flagged ? 'Yes' : 'No',
      m.visited ? 'Yes' : 'No',
      m.notes,
    ]);

    const csv = [
      headers.map(escapeCSVCell).join(','),
      ...rows.map((row) => row.map(escapeCSVCell).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mothers-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <p className="text-pink-400 font-medium animate-pulse">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 relative overflow-x-hidden">
      {/* background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <header className="bg-white/70 backdrop-blur-md border-b border-white/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-pink-200 to-rose-100 p-2 rounded-full">
                <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                  Kannamma <span className="text-pink-600">ASHA</span>
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  {asha?.name}{' '}
                  <span className="text-pink-300 mx-1">•</span>{' '}
                  {asha?.phc_name}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="group flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-300"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: PHC stock */}
          <div className="lg:col-span-3">
            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl overflow-hidden p-1">
              <PHCStockPanel />
            </div>
          </div>

          {/* Center: mothers list */}
          <div className="lg:col-span-6">
            <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pink-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Assigned Mothers{' '}
                    <span className="bg-pink-100 text-pink-600 text-sm px-2 py-0.5 rounded-full ml-1">
                      {mothers.length}
                    </span>
                  </h2>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-pink-100 hover:bg-pink-50 text-gray-600 hover:text-pink-600 rounded-xl transition shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">
                      CSV
                    </span>
                  </button>
                  <button
                    onClick={() => setShowCallAll(true)}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call All</span>
                  </button>
                </div>
              </div>

              <div
                className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar"
                style={{ maxHeight: 'calc(100vh - 250px)' }}
              >
                {mothers.map((mother) => (
                  <div
                    key={mother.id}
                    className="transform transition-transform hover:scale-[1.01]"
                  >
                    <MotherCard
                      mother={mother}
                      onView={(id) => {
                        window.location.href = `/mother/${id}`;
                      }}
                      onMarkVisited={handleMarkVisited}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: flagged + call logs */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl overflow-hidden p-1">
              <FlaggedMothersList
                mothers={mothers}
                onView={(id) => {
                  window.location.href = `/mother/${id}`;
                }}
              />
            </div>
            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl overflow-hidden p-1">
              <CallLogsList callLogs={callLogs} mothers={mothers} />
            </div>
          </div>
        </div>
      </main>

      {showCallAll && (
        <CallAllModal
          mothers={mothers}
          onComplete={handleCallAllComplete}
          onClose={() => setShowCallAll(false)}
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(244, 114, 182, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(244, 114, 182, 0.6);
        }
      `}</style>
    </div>
  );
}
