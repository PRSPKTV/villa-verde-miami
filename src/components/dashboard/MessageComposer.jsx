import { useState } from 'react';
import { Send, Code } from 'lucide-react';

const SHORTCODES = [
  { key: '{guest_name}', label: 'Guest Name' },
  { key: '{check_in_date}', label: 'Check-in' },
  { key: '{check_out_date}', label: 'Check-out' },
  { key: '{property_name}', label: 'Property' },
  { key: '{confirmation_code}', label: 'Confirm #' },
  { key: '{door_code}', label: 'Door Code' },
  { key: '{wifi_name}', label: 'WiFi Name' },
  { key: '{wifi_password}', label: 'WiFi Pass' },
];

export default function MessageComposer({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const [showShortcodes, setShowShortcodes] = useState(false);

  const insertShortcode = (code) => {
    setMessage(prev => prev + code);
    setShowShortcodes(false);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-verde-100 bg-surface">
      {showShortcodes && (
        <div className="mb-2 flex flex-wrap gap-1">
          {SHORTCODES.map(sc => (
            <button
              key={sc.key}
              onClick={() => insertShortcode(sc.key)}
              className="px-2 py-1 rounded-lg bg-verde-50 text-verde-600 font-data text-[10px] hover:bg-verde-100 transition-colors border border-verde-100"
            >
              {sc.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowShortcodes(!showShortcodes)}
          title="Insert shortcode"
          className={`p-2 rounded-lg transition-colors shrink-0 ${showShortcodes ? 'bg-verde-500 text-cream-100' : 'text-text-muted hover:bg-verde-50'}`}
        >
          <Code size={16} />
        </button>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-3 py-2 rounded-xl border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 resize-none max-h-24"
          style={{ minHeight: '38px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="p-2 bg-verde-500 text-cream-100 rounded-xl hover:bg-verde-600 transition-colors disabled:opacity-50 shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
