import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import LocationSection from '../LocationSection.jsx';
import { MAP } from '../../data/content';
import { mapEmbed } from '../../utils/localize';

const ui = {
  location: {
    headline: 'Location',
    blurb: 'Ponta do Ouro, Mozambique',
    items: ['Village centre', 'Close to the beach'],
    viewMap: 'View Interactive Map',
  },
};

let previousIframeLoading;
beforeAll(() => {
  // Verify the iframe markup without fetching Google Maps in a unit test.
  previousIframeLoading = window.happyDOM.settings.disableIframePageLoading;
  window.happyDOM.settings.disableIframePageLoading = true;
});
afterEach(cleanup);
afterAll(() => {
  window.happyDOM.settings.disableIframePageLoading = previousIframeLoading;
});

function expectFillsFrame(element) {
  for (const name of ['absolute', 'inset-0', 'w-full', 'h-full']) {
    expect(element.classList.contains(name), name).toBe(true);
  }
  expect(element.classList.contains('h-80')).toBe(false);
  expect(element.parentElement).toBe(screen.getByTestId('location-map-frame'));
}

describe('Location map fills its responsive frame in every state', () => {
  it('keeps a minimum map height while allowing the desktop grid to stretch the frame', () => {
    render(<LocationSection ui={ui} />);
    const frame = screen.getByTestId('location-map-frame');
    expect(frame.classList.contains('min-h-[20rem]')).toBe(true);
    expect(frame.classList.contains('relative')).toBe(true);
    expect(frame.classList.contains('overflow-hidden')).toBe(true);
    expect(frame.classList.contains('h-80')).toBe(false);
  });

  it('makes the initial static map cover the entire frame without distortion', () => {
    render(<LocationSection ui={ui} />);
    const image = screen.getByTestId('img-location-map');
    expectFillsFrame(image);
    expect(image.classList.contains('object-cover')).toBe(true);
    expect(image.classList.contains('block')).toBe(true);
    expect(screen.getByTestId('button-load-map').classList.contains('inset-0')).toBe(true);
  });

  it('loads the interactive map at full frame height and keeps the correct destination', () => {
    render(<LocationSection ui={ui} />);
    fireEvent.click(screen.getByRole('button', { name: 'View Interactive Map' }));
    const map = screen.getByTitle('DEVOCEAN Lodge Map');
    expectFillsFrame(map);
    expect(map.classList.contains('block')).toBe(true);
    expect(map.classList.contains('border-0')).toBe(true);
    expect(map.getAttribute('src')).toBe(mapEmbed(MAP.lat, MAP.lng, MAP.zoom));
    expect(screen.queryByTestId('button-load-map')).toBeNull();
    expect(screen.queryByTestId('img-location-map')).toBeNull();
  });

  it('fills the frame even when the static image fails and still allows opening the map', () => {
    render(<LocationSection ui={ui} />);
    fireEvent.error(screen.getByTestId('img-location-map'));
    expectFillsFrame(screen.getByTestId('img-location-map-placeholder'));
    fireEvent.click(screen.getByRole('button', { name: 'View Interactive Map' }));
    expectFillsFrame(screen.getByTitle('DEVOCEAN Lodge Map'));
    expect(screen.queryByTestId('img-location-map-placeholder')).toBeNull();
  });

  it('keeps the active map filling the same frame when translated text changes height', () => {
    const { rerender } = render(<LocationSection ui={ui} />);
    fireEvent.click(screen.getByTestId('button-load-map'));
    const frame = screen.getByTestId('location-map-frame');
    rerender(
      <LocationSection ui={{
        location: {
          ...ui.location,
          headline: 'Localisation',
          items: ['Transports en commun et transferts privés depuis Maputo et la frontière de Kosi Bay disponibles', ...ui.location.items],
        },
      }} />,
    );
    expect(screen.getByTestId('location-map-frame')).toBe(frame);
    expectFillsFrame(screen.getByTitle('DEVOCEAN Lodge Map'));
  });
});
