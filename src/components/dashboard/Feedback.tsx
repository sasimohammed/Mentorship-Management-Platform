import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Feedback as FeedbackType, Profile } from '../../lib/supabase';
import { MessageSquare, Star } from 'lucide-react';

type FeedbackWithGiver = FeedbackType & {
  giver?: Profile;
};

export function Feedback() {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackWithGiver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.committee_id) {
      loadFeedback();
    }
  }, [profile]);

  const loadFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          giver:given_by(full_name, role)
        `)
        .eq('committee_id', profile!.committee_id!)
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data as FeedbackWithGiver[] || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
          <MessageSquare className="w-8 h-8 text-purple-600" />
          <span>Feedback</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Review feedback from your mentors and committee heads
        </p>
      </div>

      {feedback.length > 0 ? (
        <div className="space-y-6">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {item.giver?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.giver?.full_name || 'Admin'}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {item.giver?.role}
                      </div>
                    </div>
                  </div>
                </div>
                {item.rating && renderStars(item.rating)}
              </div>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{item.content}</p>
              <div className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No feedback yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Feedback from your mentors will appear here
          </p>
        </div>
      )}
    </div>
  );
}
