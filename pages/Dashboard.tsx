import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mothersAPI, ivrAPI, Mother, CallLog } from '../lib/api';
import { PHCStockPanel } from '../components/PHCStockPanel';
import { MotherCard } from '../components/MotherCard';
import { FlaggedMothersList } from '../components/FlaggedMothersList';
import { CallLogsList } from '../components/CallLogsList';
import { CallAllModal } from '../components/CallAllModal';
import { LogOut, Phone, Download } from 'lucide-react';

export function Dashboard() {
  const { asha, logout } = useAuth();
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCallAll, setShowCallAll] = useState(false);

  useEffect(() => {
    loadData();
  }, [asha]);

  const loadData = async () => {
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
  };

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
      // Update flagged status for mothers who didn't answer or pressed 2
      const updatePromises = [];
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
    const headers = ['Name', 'Age', 'Phone', 'Address', 'Last ANC Date', 'Gestation Weeks', 'Flagged', 'Visited', 'Notes'];
    const rows = mothers.map(m => [
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
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mothers-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Kannamma ASHA Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                {asha?.name} | {asha?.phc_name} | {mothers.length} Assigned Mothers
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <PHCStockPanel />
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Assigned Mothers ({mothers.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export CSV</span>
                  </button>
                  <button
                    onClick={() => setShowCallAll(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call All</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {mothers.map(mother => (
                  <MotherCard
                    key={mother.id}
                    mother={mother}
                    onView={(id) => (window.location.href = `/mother/${id}`)}
                    onMarkVisited={handleMarkVisited}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <FlaggedMothersList
              mothers={mothers}
              onView={(id) => (window.location.href = `/mother/${id}`)}
            />
            <CallLogsList callLogs={callLogs} mothers={mothers} />
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
    </div>
  );
}
