import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '../separator';

describe('Separator', () => {
  it('renders separator', () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId('sep')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Separator className="custom-sep" data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveClass('custom-sep');
  });

  it('renders horizontal by default', () => {
    render(<Separator data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveAttribute('data-orientation', 'vertical');
  });

  it('applies decorative attribute', () => {
    render(<Separator decorative data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveAttribute('role', 'none');
  });

  it('has default styling', () => {
    render(<Separator data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveClass('shrink-0', 'bg-border');
  });
});
