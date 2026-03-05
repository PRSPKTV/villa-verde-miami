import { format, formatDistanceToNow } from 'date-fns';
import { Search, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function ConversationList({ conversations, selectedBookingId, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.booking.guest_first_name?.toLowerCase().includes(q) ||
      c.booking.guest_last_name?.toLowerCase().includes(q) ||
      c.booking.confirmation_code?.toLowerCase().includes(q) ||
      c.booking.property_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-verde-100">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guests..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="p-6 text-center">
            <MessageCircle size={24} className="mx-auto text-text-muted mb-2" />
            <p className="font-body text-sm text-text-muted">No conversations found</p>
          </div>
        )}

        {filtered.map(convo => {
          const { booking, lastMessage, unreadCount } = convo;
          const isActive = booking.id === selectedBookingId;
          const guestName = `${booking.guest_first_name || ''} ${booking.guest_last_name || ''}`.trim() || 'Guest';

          return (
            <button
              key={booking.id}
              onClick={() => onSelect(booking.id)}
              className={`w-full text-left p-3 border-b border-verde-50 transition-colors ${isActive ? 'bg-verde-50' : 'hover:bg-cream-50'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-verde-500 text-cream-100 flex items-center justify-center font-body text-sm font-bold shrink-0">
                  {guestName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm font-semibold text-verde-800 truncate">{guestName}</span>
                    {lastMessage && (
                      <span className="font-data text-[10px] text-text-muted shrink-0 ml-2">
                        {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-text-muted truncate">{booking.property_name}</p>
                  <p className="font-body text-xs text-text-muted truncate mt-0.5">
                    {format(new Date(booking.check_in), 'MMM d')} — {format(new Date(booking.check_out), 'MMM d')}
                  </p>
                  {lastMessage && (
                    <p className="font-body text-xs text-text-secondary truncate mt-1">
                      {lastMessage.sender_type === 'host' ? 'You: ' : ''}{lastMessage.message}
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-verde-500 text-cream-100 font-data text-[10px] flex items-center justify-center shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
