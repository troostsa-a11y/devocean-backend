import { useState } from 'react';
import { MapPin, Map as MapIcon } from 'lucide-react';
import { mapEmbed, directionsUrl } from '../utils/localize';
import { MAP } from '../data/content';

export default function LocationSection({ ui }) {
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [staticMapFailed, setStaticMapFailed] = useState(false);

  const staticMapUrl = `/api/static-map?lat=${MAP.lat}&lng=${MAP.lng}&zoom=${MAP.zoom}&width=896&height=320`;

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
              {staticMapFailed ? (
                <div
                  className="w-full h-80 flex flex-col items-center justify-between py-10 bg-gradient-to-br from-sky-100 via-slate-100 to-emerald-50"
                  data-testid="img-location-map-placeholder"
                >
                  <MapPin size={36} className="text-sky-500/70" />
                  <span className="text-sm font-medium text-slate-500">{ui.location.headline}</span>
                </div>
              ) : (
                <img
                  src={staticMapUrl}
                  alt="DEVOCEAN Lodge Location Map"
                  className="w-full h-80 object-cover"
                  loading="lazy"
                  onError={() => setStaticMapFailed(true)}
                  data-testid="img-location-map"
                />
              )}
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
