import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Switch } from '../switch';

describe('Switch', () => {
  it('renders switch', () => {
    render(<Switch data-testid="switch" />);
    expect(screen.getByTestId('switch')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Switch className="custom-switch" data-testid="switch" />);
    expect(screen.getByTestId('switch')).toHaveClass('custom-switch');
  });

  it('renders as button role', () => {
    render(<Switch data-testid="switch" />);
    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('role', 'switch');
  });

  it('has unchecked state by default', () => {
    render(<Switch data-testid="switch" />);
    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
  });

  it('can be checked', () => {
    render(<Switch checked data-testid="switch" />);
    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Switch disabled data-testid="switch" />);
    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toBeDisabled();
  });

  it('has default styling', () => {
    render(<Switch data-testid="switch" />);
    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveClass('peer', 'inline-flex');
  });
});
