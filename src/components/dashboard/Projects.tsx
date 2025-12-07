import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Project } from '../../lib/supabase';
import { FolderKanban, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function Projects() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.committee_id) {
      loadProjects();
    }
  }, [profile]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('committee_id', profile!.committee_id!)
        .eq('assigned_to', profile!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, status: Project['status']) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) throw error;
      loadProjects();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const updateSubmissionUrl = async (projectId: string, url: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ submission_url: url, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) throw error;
      loadProjects();
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
          <FolderKanban className="w-8 h-8 text-purple-600" />
          <span>My Projects</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and track your assigned projects
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(project.status)}
                    <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {project.due_date && (
                <div className="text-sm text-gray-600 mb-4">
                  Due: {new Date(project.due_date).toLocaleDateString()}
                </div>
              )}

              <div className="flex items-center space-x-4">
                <select
                  value={project.status}
                  onChange={(e) => updateProjectStatus(project.id, e.target.value as Project['status'])}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <input
                  type="url"
                  placeholder="Submission URL"
                  defaultValue={project.submission_url || ''}
                  onBlur={(e) => {
                    if (e.target.value !== project.submission_url) {
                      updateSubmissionUrl(project.id, e.target.value);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No projects assigned yet</p>
        </div>
      )}
    </div>
  );
}
