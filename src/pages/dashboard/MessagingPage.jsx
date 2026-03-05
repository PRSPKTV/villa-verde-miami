import { useState, useEffect } from 'react';
import { useConversations, useMessages } from '@/hooks/useMessages';
import { useMessageMutations } from '@/hooks/useMessageMutations';
import ConversationList from '@/components/dashboard/ConversationList';
import MessageThread from '@/components/dashboard/MessageThread';
import MessageComposer from '@/components/dashboard/MessageComposer';
import { MessageCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MessagingPage() {
  const { conversations, loading: convosLoading, refetch: refetchConvos } = useConversations();
  const { sendMessage, markAsRead } = useMessageMutations();
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const { messages, loading: msgsLoading, refetch: refetchMsgs } = useMessages(selectedBookingId);
  const selectedConvo = conversations.find(c => c.booking.id === selectedBookingId);

  // Mark unread messages as read when conversation is selected
  useEffect(() => {
    if (!selectedBookingId || !messages.length) return;
    const unread = messages.filter(m => !m.is_read && m.sender_type !== 'host' && !m._isEmail).map(m => m.id);
    if (unread.length > 0) {
      markAsRead(unread).then(() => refetchConvos());
    }
  }, [selectedBookingId, messages]);

  const handleSend = async (text) => {
    if (!selectedBookingId) return;
    await sendMessage(selectedBookingId, text, 'host');
    refetchMsgs();
    refetchConvos();
  };

  if (convosLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-verde-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-verde-800">Messages</h1>
          <p className="text-text-secondary font-body mt-1">Communicate with guests and manage templates.</p>
        </div>
        <Link
          to="/dashboard/messages/templates"
          className="flex items-center gap-2 px-4 py-2 bg-cream-50 text-verde-700 rounded-xl font-body text-sm font-semibold hover:bg-verde-50 border border-verde-200 transition-colors"
        >
          <Settings size={16} /> Templates
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className="w-80 border-r border-verde-100 shrink-0">
            <ConversationList
              conversations={conversations}
              selectedBookingId={selectedBookingId}
              onSelect={setSelectedBookingId}
            />
          </div>

          {/* Message Thread + Composer */}
          <div className="flex-1 flex flex-col">
            {selectedBookingId ? (
              <>
                <MessageThread messages={messages} booking={selectedConvo?.booking} />
                <MessageComposer onSend={handleSend} disabled={msgsLoading} />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <MessageCircle size={48} className="text-verde-200 mb-3" />
                <p className="font-heading text-xl font-bold text-verde-800 mb-1">Your Messages</p>
                <p className="font-body text-sm text-text-muted">Select a conversation to view messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
