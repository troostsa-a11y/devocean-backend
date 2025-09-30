import { MapPin } from 'lucide-react';
import { mapEmbed } from '../utils/localize';
import { MAP } from '../data/content';

export default function LocationSection({ ui }) {
  return (
    <section id="location" className="bg-slate-50 border-y">
      <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">{ui.location.headline}</h2>
          <p className="mt-2 text-slate-600">{ui.location.blurb}</p>
          <ul className="mt-4 space-y-2 text-slate-700">
            {ui.location.items.map((li, i) => (
              <li key={i} className="flex items-start gap-2">
                <MapPin className="mt-1" size={20} /> {li}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl overflow-hidden border shadow">
          <iframe
            title="DEVOCEAN Lodge Map"
            src={mapEmbed(MAP.lat, MAP.lng, MAP.zoom)}
            className="w-full h-80"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
