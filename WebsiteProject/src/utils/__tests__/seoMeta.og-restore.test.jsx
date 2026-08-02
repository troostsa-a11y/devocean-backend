/**
 * seoMeta.og-restore.test.jsx
 *
 * Confirms that useSeoPage correctly sets and restores OG/Twitter meta tags
 * during SPA navigation between experience pages.
 *
 * In the real app a single ExperienceDetailPage component stays mounted and
 * receives new props as the route key changes (wouter re-renders the same
 * component for /experiences/diving → /experiences/dolphins). The hook's
 * dep-array reruns the effect with new values, which is what `rerender` tests.
 *
 * The suite covers:
 *   1. Tags are set correctly on initial mount (diving).
 *   2. Tags update correctly on in-place navigation (diving → dolphins).
 *   3. Tags update correctly when navigating back (dolphins → diving).
 *   4. Tags are restored to the original baseline after the page unmounts.
 *   5. Tags that didn't exist before mount are removed on unmount.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useSeoPage } from '../seoMeta';

// ─── helpers ────────────────────────────────────────────────────────────────

function seedOgTag(property, content) {
  const tag = document.createElement('meta');
  tag.setAttribute('property', property);
  tag.content = content;
  document.head.appendChild(tag);
}

function seedTwitterTag(name, content) {
  const tag = document.createElement('meta');
  tag.setAttribute('name', name);
  tag.content = content;
  document.head.appendChild(tag);
}

function ogContent(property) {
  const tag = document.querySelector(`meta[property="${property}"]`);
  return tag ? tag.content : null;
}

function twitterContent(name) {
  const tag = document.querySelector(`meta[name="${name}"]`);
  return tag ? tag.content : null;
}

function seedCanonical(href) {
  const tag = document.createElement('link');
  tag.rel = 'canonical';
  tag.href = href;
  document.head.appendChild(tag);
}

function canonicalHref() {
  const tag = document.querySelector('link[rel="canonical"]');
  return tag ? tag.href : null;
}

function clearMetaTags() {
  document.querySelectorAll(
    'meta[property^="og:"], meta[name^="twitter:"], meta[name="description"], link[rel="canonical"]'
  ).forEach(t => t.remove());
}

// ─── wrapper component ───────────────────────────────────────────────────────

function SeoTestPage({ seoProps }) {
  useSeoPage(seoProps);
  return null;
}

// ─── fixtures ────────────────────────────────────────────────────────────────

const BASELINE_CANONICAL = 'https://devoceanlodge.com/';
const BASELINE_TITLE = 'DEVOCEAN Lodge';
const BASELINE_OG = {
  'og:title':       'DEVOCEAN Lodge - Eco Beach Accommodation Mozambique',
  'og:description': 'Baseline home description',
  'og:image':       'https://devoceanlodge.com/images/og-home.jpg',
  'og:url':         'https://devoceanlodge.com/',
  'og:type':        'website',
};
const BASELINE_TWITTER = {
  'twitter:title':       'DEVOCEAN Lodge',
  'twitter:description': 'Baseline home twitter description',
  'twitter:image':       'https://devoceanlodge.com/images/og-home.jpg',
};

const DIVING_SEO = {
  title:              'Scuba Diving - DEVOCEAN Lodge | Ponta do Ouro, Mozambique',
  description:        'Scuba diving in Ponta do Ouro, Mozambique.',
  canonical:          'https://devoceanlodge.com/experiences/diving',
  ogTitle:            'Scuba Diving - DEVOCEAN Lodge',
  ogDescription:      'Explore coral reefs and marine life.',
  ogImage:            'https://devoceanlodge.com/images/diving-hero.jpg',
  ogUrl:              'https://devoceanlodge.com/experiences/diving',
  ogType:             'website',
  twitterTitle:       'Scuba Diving - DEVOCEAN Lodge',
  twitterDescription: 'Explore coral reefs and marine life.',
  twitterImage:       'https://devoceanlodge.com/images/diving-hero.jpg',
};

const DOLPHINS_SEO = {
  title:              'Swim with Dolphins - DEVOCEAN Lodge | Ponta do Ouro, Mozambique',
  description:        'Swim with wild dolphins in Ponta do Ouro, Mozambique.',
  canonical:          'https://devoceanlodge.com/experiences/dolphins',
  ogTitle:            'Swim with Dolphins - DEVOCEAN Lodge',
  ogDescription:      'Ethical ocean safari with bottlenose dolphins.',
  ogImage:            'https://devoceanlodge.com/images/dolphins-hero.jpg',
  ogUrl:              'https://devoceanlodge.com/experiences/dolphins',
  ogType:             'website',
  twitterTitle:       'Swim with Dolphins - DEVOCEAN Lodge',
  twitterDescription: 'Ethical ocean safari with bottlenose dolphins.',
  twitterImage:       'https://devoceanlodge.com/images/dolphins-hero.jpg',
};

// ─── tests ───────────────────────────────────────────────────────────────────

describe('useSeoPage — OG/Twitter tags during experience page navigation', () => {
  beforeEach(() => {
    clearMetaTags();
    document.title = BASELINE_TITLE;
    Object.entries(BASELINE_OG).forEach(([prop, val]) => seedOgTag(prop, val));
    Object.entries(BASELINE_TWITTER).forEach(([name, val]) => seedTwitterTag(name, val));
    seedCanonical(BASELINE_CANONICAL);
  });

  afterEach(() => {
    clearMetaTags();
  });

  // ── 1. Initial mount ─────────────────────────────────────────────────────

  it('sets OG tags correctly when the diving page first mounts', () => {
    const { unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);

    expect(ogContent('og:title')).toBe(DIVING_SEO.ogTitle);
    expect(ogContent('og:description')).toBe(DIVING_SEO.ogDescription);
    expect(ogContent('og:image')).toBe(DIVING_SEO.ogImage);
    expect(ogContent('og:url')).toBe(DIVING_SEO.ogUrl);
    expect(document.title).toBe(DIVING_SEO.title);

    unmount();
  });

  it('sets Twitter tags correctly when the diving page first mounts', () => {
    const { unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);

    expect(twitterContent('twitter:title')).toBe(DIVING_SEO.twitterTitle);
    expect(twitterContent('twitter:description')).toBe(DIVING_SEO.twitterDescription);
    expect(twitterContent('twitter:image')).toBe(DIVING_SEO.twitterImage);

    unmount();
  });

  // ── 2. In-place re-render: diving → dolphins (same component, new props) ─

  it('updates OG tags when navigating from diving to dolphins (same component, new props)', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    expect(ogContent('og:title')).toBe(DIVING_SEO.ogTitle);

    // Simulate route change: same ExperienceDetailPage gets new experienceKey
    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);

    expect(ogContent('og:title')).toBe(DOLPHINS_SEO.ogTitle);
    expect(ogContent('og:description')).toBe(DOLPHINS_SEO.ogDescription);
    expect(ogContent('og:image')).toBe(DOLPHINS_SEO.ogImage);
    expect(ogContent('og:url')).toBe(DOLPHINS_SEO.ogUrl);
    expect(document.title).toBe(DOLPHINS_SEO.title);

    unmount();
  });

  it('updates Twitter tags when navigating from diving to dolphins', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);

    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);

    expect(twitterContent('twitter:title')).toBe(DOLPHINS_SEO.twitterTitle);
    expect(twitterContent('twitter:description')).toBe(DOLPHINS_SEO.twitterDescription);
    expect(twitterContent('twitter:image')).toBe(DOLPHINS_SEO.twitterImage);

    unmount();
  });

  // ── 3. Navigate back: dolphins → diving ──────────────────────────────────

  it('updates OG tags correctly when navigating back from dolphins to diving', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);

    // Navigate back to diving
    rerender(<SeoTestPage seoProps={DIVING_SEO} />);

    expect(ogContent('og:title')).toBe(DIVING_SEO.ogTitle);
    expect(ogContent('og:image')).toBe(DIVING_SEO.ogImage);
    expect(ogContent('og:url')).toBe(DIVING_SEO.ogUrl);
    expect(document.title).toBe(DIVING_SEO.title);

    unmount();
  });

  it('updates Twitter tags correctly when navigating back from dolphins to diving', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);
    rerender(<SeoTestPage seoProps={DIVING_SEO} />);

    expect(twitterContent('twitter:title')).toBe(DIVING_SEO.twitterTitle);
    expect(twitterContent('twitter:image')).toBe(DIVING_SEO.twitterImage);

    unmount();
  });

  // ── 4. Unmount: full restore to baseline ─────────────────────────────────

  it('restores all OG tags to the baseline after the experience page unmounts', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);
    unmount();

    expect(ogContent('og:title')).toBe(BASELINE_OG['og:title']);
    expect(ogContent('og:description')).toBe(BASELINE_OG['og:description']);
    expect(ogContent('og:image')).toBe(BASELINE_OG['og:image']);
    expect(ogContent('og:url')).toBe(BASELINE_OG['og:url']);
    expect(ogContent('og:type')).toBe(BASELINE_OG['og:type']);
  });

  it('restores all Twitter tags to the baseline after the experience page unmounts', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);
    unmount();

    expect(twitterContent('twitter:title')).toBe(BASELINE_TWITTER['twitter:title']);
    expect(twitterContent('twitter:description')).toBe(BASELINE_TWITTER['twitter:description']);
    expect(twitterContent('twitter:image')).toBe(BASELINE_TWITTER['twitter:image']);
  });

  it('restores document.title to the baseline after the experience page unmounts', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);
    unmount();

    expect(document.title).toBe(BASELINE_TITLE);
  });

  // ── 5. Edge: tags created from scratch are removed on unmount ────────────

  it('removes OG tags that were created by the page when none existed before', () => {
    clearMetaTags(); // No pre-existing OG/Twitter tags

    const { unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    expect(ogContent('og:title')).toBe(DIVING_SEO.ogTitle);

    unmount();

    expect(ogContent('og:title')).toBeNull();
    expect(ogContent('og:image')).toBeNull();
    expect(ogContent('og:url')).toBeNull();
  });

  it('removes Twitter tags that were created by the page when none existed before', () => {
    clearMetaTags(); // No pre-existing OG/Twitter tags

    const { unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    expect(twitterContent('twitter:title')).toBe(DIVING_SEO.twitterTitle);
    expect(twitterContent('twitter:description')).toBe(DIVING_SEO.twitterDescription);
    expect(twitterContent('twitter:image')).toBe(DIVING_SEO.twitterImage);

    unmount();

    expect(twitterContent('twitter:title')).toBeNull();
    expect(twitterContent('twitter:description')).toBeNull();
    expect(twitterContent('twitter:image')).toBeNull();
  });

  // ── 6. Canonical link — mount, navigate, restore ─────────────────────────

  it('sets the canonical href correctly when the diving page first mounts', () => {
    const { unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);

    expect(canonicalHref()).toBe(DIVING_SEO.canonical);

    unmount();
  });

  it('updates the canonical href when navigating from diving to dolphins (in-place re-render)', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    expect(canonicalHref()).toBe(DIVING_SEO.canonical);

    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);

    expect(canonicalHref()).toBe(DOLPHINS_SEO.canonical);

    unmount();
  });

  it('updates the canonical href correctly when navigating back from dolphins to diving', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);

    // Navigate back
    rerender(<SeoTestPage seoProps={DIVING_SEO} />);

    expect(canonicalHref()).toBe(DIVING_SEO.canonical);

    unmount();
  });

  it('restores the canonical href to the baseline after the experience page unmounts', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);

    unmount();

    expect(canonicalHref()).toBe(BASELINE_CANONICAL);
  });

  it('restores the canonical href to baseline after the full diving → dolphins → diving → unmount sequence', () => {
    const { rerender, unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    rerender(<SeoTestPage seoProps={DOLPHINS_SEO} />);
    rerender(<SeoTestPage seoProps={DIVING_SEO} />);

    unmount();

    expect(canonicalHref()).toBe(BASELINE_CANONICAL);
  });

  it('removes a newly created canonical tag on unmount when no canonical existed before mount', () => {
    // useSeoPage captures prevCanonical = '' (no tag); on unmount it removes
    // the tag it created rather than leaving it in the DOM.
    clearMetaTags(); // removes the seeded canonical too

    const { unmount } = render(<SeoTestPage seoProps={DIVING_SEO} />);
    expect(canonicalHref()).toBe(DIVING_SEO.canonical);

    unmount();

    // The tag was created from scratch; the hook removes it on unmount.
    expect(canonicalHref()).toBeNull();
  });
});
