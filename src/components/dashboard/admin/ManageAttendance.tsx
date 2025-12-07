import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase, Attendance, Profile, Week } from '../../../lib/supabase';
import { ClipboardCheck, Plus, Trash2 } from 'lucide-react';

type AttendanceWithUser = Attendance & {
  user?: Profile;
};

export function ManageAttendance() {
  const { profile } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceWithUser[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (profile?.committee_id) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      const [attendanceRes, membersRes, weeksRes] = await Promise.all([
        supabase
          .from('attendance')
          .select(`
            *,
            user:user_id(full_name)
          `)
          .eq('committee_id', profile!.committee_id!)
          .order('date', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('committee_id', profile!.committee_id!),
        supabase
          .from('weeks')
          .select('*')
          .eq('committee_id', profile!.committee_id!)
          .order('week_number', { ascending: true }),
      ]);

      if (attendanceRes.error) throw attendanceRes.error;
      if (membersRes.error) throw membersRes.error;
      if (weeksRes.error) throw weeksRes.error;

      setAttendance(attendanceRes.data as AttendanceWithUser[] || []);
      setMembers(membersRes.data || []);
      setWeeks(weeksRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weekId = formData.get('weekId') as string;

    const attendanceData = {
      committee_id: profile!.committee_id!,
      user_id: formData.get('userId') as string,
      week_id: weekId || null,
      date: formData.get('date') as string,
      status: formData.get('status') as Attendance['status'],
      notes: formData.get('notes') as string || null,
    };

    try {
      const { error } = await supabase.from('attendance').insert(attendanceData);
      if (error) throw error;

      setShowForm(false);
      loadData();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      const { error } = await supabase.from('attendance').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting attendance:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
      ))}
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <ClipboardCheck className="w-6 h-6" />
          <span>Manage Attendance</span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Record</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Attendance Record</h3>
          <div className="space-y-4 mb-4">
            <select
              name="userId"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
            <select
              name="weekId"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">No specific week</option>
              {weeks.map((week) => (
                <option key={week.id} value={week.id}>
                  Week {week.week_number}: {week.title}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              name="status"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="excused">Excused</option>
            </select>
            <textarea
              name="notes"
              placeholder="Notes (optional)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
            >
              Add Record
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Member</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {record.user?.full_name || 'Unknown'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    record.status === 'present' ? 'bg-green-100 text-green-700' :
                    record.status === 'absent' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {record.notes || '-'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
