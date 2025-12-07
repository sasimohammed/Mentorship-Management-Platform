import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Week } from '../../lib/supabase';
import { Calendar, BookOpen } from 'lucide-react';

export function Weeks() {
  const { profile } = useAuth();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.committee_id) {
      loadWeeks();
    }
  }, [profile]);

  const loadWeeks = async () => {
    try {
      const { data, error } = await supabase
        .from('weeks')
        .select('*')
        .eq('committee_id', profile!.committee_id!)
        .order('week_number', { ascending: true });

      if (error) throw error;
      setWeeks(data || []);
    } catch (error) {
      console.error('Error loading weeks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-purple-600" />
          <span>Learning Weeks</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Track your learning progress through weekly content
        </p>
      </div>

      {weeks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeks.map((week) => (
            <div
              key={week.id}
              onClick={() => setSelectedWeek(week)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-bold">
                  Week {week.week_number}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{week.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{week.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{new Date(week.start_date).toLocaleDateString()}</span>
                <span>-</span>
                <span>{new Date(week.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No weeks have been added yet</p>
        </div>
      )}

      {selectedWeek && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedWeek(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="text-sm font-semibold mb-2">Week {selectedWeek.week_number}</div>
              <h2 className="text-2xl font-bold">{selectedWeek.title}</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{selectedWeek.description}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Content</h3>
                <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                  {selectedWeek.content}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <span>{new Date(selectedWeek.start_date).toLocaleDateString()}</span>
                <span>to</span>
                <span>{new Date(selectedWeek.end_date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setSelectedWeek(null)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
