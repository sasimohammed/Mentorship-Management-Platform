import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Announcement, Project, Attendance } from '../../lib/supabase';
import { TrendingUp, FolderKanban, Calendar, Award } from 'lucide-react';

export function Overview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    attendanceRate: 0,
    upcomingWeeks: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.committee_id) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      const [projectsRes, attendanceRes, announcementsRes, weeksRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('committee_id', profile!.committee_id!)
          .eq('assigned_to', profile!.id),
        supabase
          .from('attendance')
          .select('*')
          .eq('committee_id', profile!.committee_id!)
          .eq('user_id', profile!.id),
        supabase
          .from('announcements')
          .select('*')
          .eq('committee_id', profile!.committee_id!)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('weeks')
          .select('*')
          .eq('committee_id', profile!.committee_id!)
          .gte('end_date', new Date().toISOString().split('T')[0]),
      ]);

      const projects = projectsRes.data || [];
      const attendance = attendanceRes.data || [];
      const announcements = announcementsRes.data || [];
      const weeks = weeksRes.data || [];

      const completed = projects.filter((p: Project) => p.status === 'completed').length;
      const presentCount = attendance.filter((a: Attendance) => a.status === 'present').length;
      const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

      setStats({
        totalProjects: projects.length,
        completedProjects: completed,
        attendanceRate: Math.round(attendanceRate),
        upcomingWeeks: weeks.length,
      });

      setRecentAnnouncements(announcements);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Completed',
      value: stats.completedProjects,
      icon: Award,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Upcoming Weeks',
      value: stats.upcomingWeeks,
      icon: Calendar,
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your mentorship progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Announcements</h2>
        {recentAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="border-l-4 border-purple-500 pl-4 py-2"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      announcement.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : announcement.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{announcement.content}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No announcements yet</p>
        )}
      </div>
    </div>
  );
}
