import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import MarinPanel from '../MarinPanel';

afterEach(() => {
  cleanup();
  delete window.devocean;
});

it('keeps a dark label on its white surface even inside a white-text CTA', () => {
  render(
    <div className="text-white">
      <MarinPanel label="Ask Marin about diving" />
    </div>,
  );
  const button = screen.getByRole('button', { name: 'Ask Marin about diving' });
  expect(button.classList.contains('bg-white')).toBe(true);
  expect(button.classList.contains('text-slate-700')).toBe(true);
  expect(button.classList.contains('hover:text-orange-800')).toBe(true);
});

it('still opens text chat with the page context and message', () => {
  const ask = vi.fn();
  window.devocean = { ask };
  render(<MarinPanel context="Experience page: Dolphins" autoMessage="Tell me more" />);
  fireEvent.click(screen.getByRole('button', { name: 'Need help? Ask Marin' }));
  expect(ask).toHaveBeenCalledWith({
    pageContext: 'Experience page: Dolphins',
    autoMessage: 'Tell me more',
  });
});