import { describe, expect, it } from 'vitest';
import { localizeInternalHref } from '../localizedLinks';

describe('localizeInternalHref', () => {
  it('keeps document links inside the current locale', () => {
    expect(localizeInternalHref('/#location', 'pt-PT')).toBe('/pt-pt/#location');
    expect(localizeInternalHref('/story', 'nl-NL')).toBe('/nl/story');
  });

  it('does not rewrite assets, files, external-style URLs, or localized paths', () => {
    expect(localizeInternalHref('/images/hero.jpg', 'pt-PT')).toBe('/images/hero.jpg');
    expect(localizeInternalHref('/downloads/guide.pdf', 'pt-PT')).toBe('/downloads/guide.pdf');
    expect(localizeInternalHref('/nl/#gallery', 'pt-PT')).toBe('/nl/#gallery');
    expect(localizeInternalHref('https://example.com/page', 'pt-PT')).toBe('https://example.com/page');
  });
});