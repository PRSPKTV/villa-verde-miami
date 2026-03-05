import {
  Wifi,
  Refrigerator,
  Phone,
  MapPin,
  Bus,
  ScrollText,
  LogIn,
  LogOut,
  ParkingCircle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';

const SECTION_ICONS = {
  wifi: Wifi,
  appliances: Refrigerator,
  emergency: Phone,
  local_recs: MapPin,
  transportation: Bus,
  house_rules: ScrollText,
  checkin: LogIn,
  checkout: LogOut,
  parking: ParkingCircle,
  custom: FileText,
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-verde-400 hover:text-verde-600 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function WifiSection({ content }) {
  return (
    <div className="bg-verde-50 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-heading font-medium text-verde-500 uppercase tracking-wide">
            Network
          </p>
          <p className="text-lg font-data font-semibold text-verde-800">
            {content.network_name || '--'}
          </p>
        </div>
        <CopyButton text={content.network_name || ''} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-heading font-medium text-verde-500 uppercase tracking-wide">
            Password
          </p>
          <p className="text-lg font-data font-semibold text-verde-800">
            {content.password || '--'}
          </p>
        </div>
        <CopyButton text={content.password || ''} />
      </div>
    </div>
  );
}

function AppliancesSection({ content }) {
  const items = content.appliances || [];
  if (items.length === 0) return <p className="text-sm font-body text-verde-400">No appliances listed.</p>;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-cream-50 rounded-xl p-3">
          <p className="font-heading font-semibold text-verde-700 text-sm">{item.name}</p>
          <p className="text-sm font-body text-verde-600 mt-1">{item.instructions}</p>
        </div>
      ))}
    </div>
  );
}

function EmergencySection({ content }) {
  const contacts = content.contacts || [];
  if (contacts.length === 0) return <p className="text-sm font-body text-verde-400">No contacts listed.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {contacts.map((c, i) => (
        <div key={i} className="bg-red-50 rounded-xl p-3 border border-red-100">
          <p className="font-heading font-semibold text-red-800 text-sm">{c.name}</p>
          <a
            href={`tel:${c.phone}`}
            className="text-sm font-data text-red-600 hover:underline"
          >
            {c.phone}
          </a>
          {c.description && (
            <p className="text-xs font-body text-red-500 mt-1">{c.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function LocalRecsSection({ content }) {
  const places = content.places || [];
  if (places.length === 0) return <p className="text-sm font-body text-verde-400">No recommendations yet.</p>;

  return (
    <div className="space-y-3">
      {places.map((place, i) => (
        <div key={i} className="flex items-start gap-3 bg-cream-50 rounded-xl p-3">
          <div className="p-1.5 bg-gold-400/20 rounded-lg shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-gold-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-heading font-semibold text-verde-700 text-sm">
                {place.name}
              </p>
              {place.category && (
                <span className="px-2 py-0.5 bg-verde-100 text-verde-600 rounded-full text-xs font-heading">
                  {place.category}
                </span>
              )}
            </div>
            {place.description && (
              <p className="text-sm font-body text-verde-600 mt-0.5">{place.description}</p>
            )}
            {place.distance && (
              <p className="text-xs font-data text-verde-400 mt-1">{place.distance}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TextSection({ content }) {
  return (
    <div className="bg-cream-50 rounded-xl p-4">
      <p className="text-sm font-body text-verde-700 whitespace-pre-wrap">
        {content.text || 'No information provided.'}
      </p>
    </div>
  );
}

function HouseRulesSection({ content }) {
  const rules = content.rules || [];
  if (rules.length === 0) return <p className="text-sm font-body text-verde-400">No house rules listed.</p>;

  return (
    <ol className="space-y-2">
      {rules.map((rule, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="flex items-center justify-center w-6 h-6 bg-verde-100 text-verde-700 rounded-full text-xs font-heading font-bold shrink-0 mt-0.5">
            {i + 1}
          </span>
          <p className="text-sm font-body text-verde-700">{rule}</p>
        </li>
      ))}
    </ol>
  );
}

function StepsSection({ content }) {
  const steps = content.steps || [];
  if (steps.length === 0) return <p className="text-sm font-body text-verde-400">No steps listed.</p>;

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="flex items-center justify-center w-8 h-8 bg-verde-600 text-white rounded-full text-sm font-heading font-bold shrink-0">
            {i + 1}
          </span>
          <div className="flex-1">
            <p className="text-sm font-body text-verde-700 mt-1">{step.text}</p>
            {step.image_url && (
              <img
                src={step.image_url}
                alt={`Step ${i + 1}`}
                className="mt-2 rounded-xl max-h-48 object-cover border border-verde-100"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ section }) {
  const Icon = SECTION_ICONS[section.section_type] || FileText;
  const content = section.content || {};

  const renderContent = () => {
    switch (section.section_type) {
      case 'wifi':
        return <WifiSection content={content} />;
      case 'appliances':
        return <AppliancesSection content={content} />;
      case 'emergency':
        return <EmergencySection content={content} />;
      case 'local_recs':
        return <LocalRecsSection content={content} />;
      case 'transportation':
      case 'parking':
      case 'custom':
        return <TextSection content={content} />;
      case 'house_rules':
        return <HouseRulesSection content={content} />;
      case 'checkin':
      case 'checkout':
        return <StepsSection content={content} />;
      default:
        return <TextSection content={content} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-verde-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-5 pb-3">
        <div className="p-2 bg-verde-50 rounded-xl">
          <Icon className="w-5 h-5 text-verde-600" />
        </div>
        <h3 className="text-base font-heading font-semibold text-verde-800">
          {section.title}
        </h3>
      </div>
      <div className="px-5 pb-5">{renderContent()}</div>
    </div>
  );
}

export default function GuidebookPreview({ sections, propertyName }) {
  const publishedSections = (sections || []).filter((s) => s.is_published);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-verde-50 rounded-full mb-4">
          <ScrollText className="w-4 h-4 text-verde-600" />
          <span className="text-xs font-heading font-medium text-verde-600 uppercase tracking-wide">
            Guest Guide
          </span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-verde-800">
          Welcome to {propertyName || 'Your Stay'}
        </h1>
        <p className="text-sm font-body text-verde-500 mt-2">
          Everything you need for a comfortable visit
        </p>
      </div>

      {/* Sections */}
      {publishedSections.length === 0 ? (
        <div className="text-center py-12 bg-cream-50 rounded-2xl border border-verde-100">
          <ScrollText className="w-8 h-8 text-verde-300 mx-auto mb-3" />
          <p className="text-sm font-body text-verde-500">
            No published guidebook sections yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {publishedSections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-8 pt-6 border-t border-verde-100">
        <p className="text-xs font-body text-verde-400">
          We hope you enjoy your stay. Don&apos;t hesitate to reach out if you need anything!
        </p>
      </div>
    </div>
  );
}
