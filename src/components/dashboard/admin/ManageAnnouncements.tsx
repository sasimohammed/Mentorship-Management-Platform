import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase, Announcement } from '../../../lib/supabase';
import { Megaphone, Plus, Edit2, Trash2 } from 'lucide-react';

export function ManageAnnouncements() {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    if (profile?.committee_id) {
      loadAnnouncements();
    }
  }, [profile]);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('committee_id', profile!.committee_id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const announcementData = {
      committee_id: profile!.committee_id!,
      created_by: profile!.id,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      priority: formData.get('priority') as Announcement['priority'],
    };

    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update({ ...announcementData, updated_at: new Date().toISOString() })
          .eq('id', editingAnnouncement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert(announcementData);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingAnnouncement(null);
      loadAnnouncements();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
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
          <Megaphone className="w-6 h-6" />
          <span>Manage Announcements</span>
        </h2>
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setShowForm(!showForm);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Announcement</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
          </h3>
          <div className="space-y-4 mb-4">
            <input
              type="text"
              name="title"
              placeholder="Announcement Title"
              defaultValue={editingAnnouncement?.title}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              name="content"
              placeholder="Announcement Content"
              defaultValue={editingAnnouncement?.content}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              name="priority"
              defaultValue={editingAnnouncement?.priority || 'medium'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
            >
              {editingAnnouncement ? 'Update Announcement' : 'Add Announcement'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingAnnouncement(null);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`p-4 rounded-lg border-l-4 ${
              announcement.priority === 'high' ? 'border-red-500 bg-red-50' :
              announcement.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    announcement.priority === 'high' ? 'bg-red-100 text-red-700' :
                    announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{announcement.content}</p>
                <div className="text-sm text-gray-600">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(announcement)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
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
