import { useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { Overview } from './Overview';
import { Weeks } from './Weeks';
import { Projects } from './Projects';
import { Attendance } from './Attendance';
import { Announcements } from './Announcements';
import { Feedback } from './Feedback';
import { AdminPanel } from './AdminPanel';

export function DashboardLayout() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Overview />;
      case 'weeks':
        return <Weeks />;
      case 'projects':
        return <Projects />;
      case 'attendance':
        return <Attendance />;
      case 'announcements':
        return <Announcements />;
      case 'feedback':
        return <Feedback />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>
    </div>
  );
}
