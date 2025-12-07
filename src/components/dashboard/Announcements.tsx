import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Announcement } from '../../lib/supabase';
import { Megaphone, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function Announcements() {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getPriorityIcon = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <Megaphone className="w-8 h-8 text-purple-600" />
          <span>Announcements</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Stay updated with important committee announcements
        </p>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`border-l-4 rounded-lg p-6 ${getPriorityColor(announcement.priority)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getPriorityIcon(announcement.priority)}
                  <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                  {announcement.priority} priority
                </span>
              </div>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{announcement.content}</p>
              <div className="text-sm text-gray-600">
                {new Date(announcement.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No announcements yet</p>
        </div>
      )}
    </div>
  );
}
