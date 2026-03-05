import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Mail, User, Bot } from 'lucide-react';

export default function MessageThread({ messages, booking }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!booking) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-body text-text-muted">Select a conversation to view messages</p>
      </div>
    );
  }

  const guestName = `${booking.guest_first_name || ''} ${booking.guest_last_name || ''}`.trim() || 'Guest';

  return (
    <div className="flex flex-col h-full">
      {/* Booking Summary Header */}
      <div className="p-4 border-b border-verde-100 bg-cream-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-body text-sm font-bold text-verde-800">{guestName}</h3>
            <p className="font-body text-xs text-text-muted">{booking.property_name}</p>
          </div>
          <div className="text-right">
            <p className="font-data text-xs text-verde-600">{booking.confirmation_code}</p>
            <p className="font-data text-[10px] text-text-muted">
              {format(new Date(booking.check_in), 'MMM d')} — {format(new Date(booking.check_out), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => {
          if (msg.sender_type === 'system' || msg._isEmail) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-verde-50 border border-verde-100">
                  <Mail size={12} className="text-verde-500" />
                  <span className="font-body text-[11px] text-verde-600">{msg.message}</span>
                  <span className="font-data text-[9px] text-text-muted ml-1">
                    {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            );
          }

          const isHost = msg.sender_type === 'host';

          return (
            <div key={msg.id} className={`flex ${isHost ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isHost ? 'order-1' : 'order-2'}`}>
                <div className={`flex items-end gap-2 ${isHost ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isHost ? 'bg-verde-500 text-cream-100' : 'bg-gold-100 text-gold-700'}`}>
                    {isHost ? <Bot size={12} /> : <User size={12} />}
                  </div>
                  <div className={`px-3 py-2 rounded-2xl ${isHost ? 'bg-verde-500 text-cream-100 rounded-br-md' : 'bg-cream-50 border border-verde-100 text-verde-800 rounded-bl-md'}`}>
                    <p className="font-body text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
                <p className={`font-data text-[9px] text-text-muted mt-1 ${isHost ? 'text-right mr-8' : 'ml-8'}`}>
                  {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
