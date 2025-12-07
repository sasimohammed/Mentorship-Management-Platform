import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase, Feedback, Profile } from '../../../lib/supabase';
import { MessageSquare, Plus, Trash2, Star } from 'lucide-react';

type FeedbackWithUser = Feedback & {
  user?: Profile;
};

export function ManageFeedback() {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackWithUser[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (profile?.committee_id) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      const [feedbackRes, membersRes] = await Promise.all([
        supabase
          .from('feedback')
          .select(`
            *,
            user:user_id(full_name, email)
          `)
          .eq('committee_id', profile!.committee_id!)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('committee_id', profile!.committee_id!)
          .eq('role', 'member'),
      ]);

      if (feedbackRes.error) throw feedbackRes.error;
      if (membersRes.error) throw membersRes.error;

      setFeedback(feedbackRes.data as FeedbackWithUser[] || []);
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
    const rating = formData.get('rating') as string;

    const feedbackData = {
      committee_id: profile!.committee_id!,
      user_id: formData.get('userId') as string,
      given_by: profile!.id,
      content: formData.get('content') as string,
      rating: rating ? parseInt(rating) : null,
    };

    try {
      const { error } = await supabase.from('feedback').insert(feedbackData);
      if (error) throw error;

      setShowForm(false);
      loadData();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
          <MessageSquare className="w-6 h-6" />
          <span>Manage Feedback</span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Give Feedback</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Give Feedback to Member</h3>
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
            <textarea
              name="content"
              placeholder="Feedback Content"
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (Optional)
              </label>
              <select
                name="rating"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">No rating</option>
                <option value="1">1 - Needs Improvement</option>
                <option value="2">2 - Below Average</option>
                <option value="3">3 - Average</option>
                <option value="4">4 - Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
            >
              Give Feedback
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

      <div className="space-y-4">
        {feedback.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {item.user?.full_name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {item.user?.full_name || 'Unknown Member'}
                    </div>
                    {item.rating && renderStars(item.rating)}
                  </div>
                </div>
                <p className="text-gray-700 mb-2 whitespace-pre-wrap">{item.content}</p>
                <div className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
