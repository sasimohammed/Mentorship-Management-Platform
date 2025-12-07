import { useState } from 'react';
import { Settings } from 'lucide-react';
import { ManageWeeks } from './admin/ManageWeeks';
import { ManageProjects } from './admin/ManageProjects';
import { ManageAttendance } from './admin/ManageAttendance';
import { ManageAnnouncements } from './admin/ManageAnnouncements';
import { ManageFeedback } from './admin/ManageFeedback';
import { ManageMembers } from './admin/ManageMembers';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<string>('members');

  const tabs = [
    { id: 'members', label: 'Members' },
    { id: 'weeks', label: 'Weeks' },
    { id: 'projects', label: 'Projects' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'feedback', label: 'Feedback' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'members':
        return <ManageMembers />;
      case 'weeks':
        return <ManageWeeks />;
      case 'projects':
        return <ManageProjects />;
      case 'attendance':
        return <ManageAttendance />;
      case 'announcements':
        return <ManageAnnouncements />;
      case 'feedback':
        return <ManageFeedback />;
      default:
        return <ManageMembers />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <Settings className="w-8 h-8 text-purple-600" />
          <span>Admin Panel</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your committee's mentorship program
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
