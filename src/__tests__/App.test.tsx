import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Router Foundation Integration', () => {
  it('renders AgriPulse Navbar and Hero title on root route', () => {
    render(<App />);
    expect(screen.getAllByText(/AgriPulse/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Know what/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/FIELD INTELLIGENCE/i)).toBeInTheDocument();
  });
});
