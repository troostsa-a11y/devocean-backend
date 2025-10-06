import { useState } from 'react';
import { MapPin, Map as MapIcon } from 'lucide-react';
import { mapEmbed, directionsUrl } from '../utils/localize';
import { MAP } from '../data/content';

export default function LocationSection({ ui }) {
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);

  const staticMapUrl = `https://devocean-api.onrender.com/api/static-map?lat=${MAP.lat}&lng=${MAP.lng}&zoom=${MAP.zoom}`;

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
        <div className="rounded-2xl overflow-hidden border shadow relative">
          {!showInteractiveMap ? (
            <>
              <img
                src={staticMapUrl}
                alt="DEVOCEAN Lodge Location Map"
                className="w-full h-80 object-cover"
                loading="lazy"
              />
              <button
                onClick={() => setShowInteractiveMap(true)}
                className="absolute inset-0 flex items-center justify-center bg-slate-900/40 hover:bg-slate-900/50 transition-colors group"
                data-testid="button-load-map"
              >
                <span className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg group-hover:scale-105 transition-transform">
                  <MapIcon size={20} />
                  {ui.location.viewMap || 'View Interactive Map'}
                </span>
              </button>
            </>
          ) : (
            <iframe
              title="DEVOCEAN Lodge Map"
              src={mapEmbed(MAP.lat, MAP.lng, MAP.zoom)}
              className="w-full h-80"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      </div>
    </section>
  );
}
