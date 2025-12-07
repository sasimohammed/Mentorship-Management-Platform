import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  ClipboardCheck,
  Megaphone,
  MessageSquare,
  Settings,
  Star,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'weeks', label: 'Weeks', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  if (profile?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Settings });
  }

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-purple-900 to-indigo-900 text-white flex flex-col">
      <div className="p-6 border-b border-purple-700">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg">
            <Star className="w-8 h-8 text-purple-600" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold">STAR</h1>
            <p className="text-xs text-purple-300">Mentorship Platform</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'text-purple-100 hover:bg-purple-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-purple-700">
        <div className="mb-4">
          <div className="text-sm font-medium">{profile?.full_name}</div>
          <div className="text-xs text-purple-300 capitalize">{profile?.role}</div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-purple-100 hover:bg-purple-800/50 transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
