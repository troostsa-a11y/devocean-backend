import { IMG } from '../data/content';

export default function GallerySection({ ui }) {
  return (
    <section id="gallery" className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold">{ui.galleryHeading}</h2>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {IMG.gallery.map((src, i) => (
          <div
            key={i}
            className="relative group rounded-xl overflow-hidden"
          >
            <img
              src={src}
              alt={`DEVOCEAN Lodge gallery ${i + 1}`}
              className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
