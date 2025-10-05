import { m } from 'framer-motion';
import { IMG } from '../data/content';
import LazyImage from './LazyImage';

export default function GallerySection({ ui }) {
  return (
    <section id="gallery" className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold">{ui.galleryHeading}</h2>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {IMG.gallery.map((src, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative group rounded-xl overflow-hidden"
          >
            <LazyImage
              src={src}
              alt={`DEVOCEAN Lodge gallery ${i + 1}`}
              className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition"
            />
          </m.div>
        ))}
      </div>
    </section>
  );
}
