import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase, Week } from '../../../lib/supabase';
import { Calendar, Plus, Edit2, Trash2 } from 'lucide-react';

export function ManageWeeks() {
  const { profile } = useAuth();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWeek, setEditingWeek] = useState<Week | null>(null);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weekData = {
      committee_id: profile!.committee_id!,
      week_number: parseInt(formData.get('weekNumber') as string),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      content: formData.get('content') as string,
      start_date: formData.get('startDate') as string,
      end_date: formData.get('endDate') as string,
    };

    try {
      if (editingWeek) {
        const { error } = await supabase
          .from('weeks')
          .update(weekData)
          .eq('id', editingWeek.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('weeks').insert(weekData);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingWeek(null);
      loadWeeks();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error saving week:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this week?')) return;

    try {
      const { error } = await supabase.from('weeks').delete().eq('id', id);
      if (error) throw error;
      loadWeeks();
    } catch (error) {
      console.error('Error deleting week:', error);
    }
  };

  const handleEdit = (week: Week) => {
    setEditingWeek(week);
    setShowForm(true);
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
      ))}
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <Calendar className="w-6 h-6" />
          <span>Manage Weeks</span>
        </h2>
        <button
          onClick={() => {
            setEditingWeek(null);
            setShowForm(!showForm);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Week</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingWeek ? 'Edit Week' : 'Add New Week'}
          </h3>
          <div className="space-y-4 mb-4">
            <input
              type="number"
              name="weekNumber"
              placeholder="Week Number"
              defaultValue={editingWeek?.week_number}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              name="title"
              placeholder="Week Title"
              defaultValue={editingWeek?.title}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              name="description"
              placeholder="Description"
              defaultValue={editingWeek?.description}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              name="content"
              placeholder="Week Content (learning materials, resources, etc.)"
              defaultValue={editingWeek?.content}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={editingWeek?.start_date}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={editingWeek?.end_date}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
            >
              {editingWeek ? 'Update Week' : 'Add Week'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingWeek(null);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {weeks.map((week) => (
          <div key={week.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-lg font-semibold text-sm">
                    Week {week.week_number}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{week.title}</h3>
                </div>
                <p className="text-gray-600 mb-2">{week.description}</p>
                <div className="text-sm text-gray-500">
                  {new Date(week.start_date).toLocaleDateString()} - {new Date(week.end_date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(week)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(week.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
