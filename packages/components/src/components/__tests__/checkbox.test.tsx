import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  it('renders checkbox', () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Checkbox className="custom-checkbox" data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveClass('custom-checkbox');
  });

  it('renders with checkbox role', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('role', 'checkbox');
  });

  it('has unchecked state by default', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('can be checked', () => {
    render(<Checkbox checked data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('has default styling', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('peer', 'h-4', 'w-4');
  });
});
