import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase, Project, Profile } from '../../../lib/supabase';
import { FolderKanban, Plus, Edit2, Trash2 } from 'lucide-react';

export function ManageProjects() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (profile?.committee_id) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      const [projectsRes, membersRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('committee_id', profile!.committee_id!)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('committee_id', profile!.committee_id!)
          .eq('role', 'member'),
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (membersRes.error) throw membersRes.error;

      setProjects(projectsRes.data || []);
      setMembers(membersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignedTo = formData.get('assignedTo') as string;

    const projectData = {
      committee_id: profile!.committee_id!,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      assigned_to: assignedTo || null,
      status: formData.get('status') as Project['status'],
      due_date: formData.get('dueDate') as string || null,
    };

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update({ ...projectData, updated_at: new Date().toISOString() })
          .eq('id', editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert(projectData);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingProject(null);
      loadData();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
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
          <FolderKanban className="w-6 h-6" />
          <span>Manage Projects</span>
        </h2>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowForm(!showForm);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Project</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h3>
          <div className="space-y-4 mb-4">
            <input
              type="text"
              name="title"
              placeholder="Project Title"
              defaultValue={editingProject?.title}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              name="description"
              placeholder="Project Description"
              defaultValue={editingProject?.description}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              name="assignedTo"
              defaultValue={editingProject?.assigned_to || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={editingProject?.status || 'pending'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date (Optional)</label>
              <input
                type="date"
                name="dueDate"
                defaultValue={editingProject?.due_date || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
            >
              {editingProject ? 'Update Project' : 'Add Project'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-2">{project.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded ${
                    project.status === 'completed' ? 'bg-green-100 text-green-700' :
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  {project.due_date && (
                    <span>Due: {new Date(project.due_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
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
