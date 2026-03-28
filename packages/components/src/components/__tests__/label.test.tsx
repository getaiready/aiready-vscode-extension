import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label', () => {
  it('renders label with text', () => {
    render(<Label>Name</Label>);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Label className="custom-label">Test</Label>);
    expect(screen.getByText('Test')).toHaveClass('custom-label');
  });

  it('renders as label element', () => {
    render(<Label data-testid="label">Label</Label>);
    const label = screen.getByTestId('label');
    expect(label.tagName).toBe('LABEL');
  });

  it('associates with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>
    );
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email');
  });

  it('applies default styling', () => {
    render(<Label data-testid="styled">Styled</Label>);
    const label = screen.getByTestId('styled');
    expect(label).toHaveClass('text-sm', 'font-medium');
  });

  it('renders with children elements', () => {
    render(
      <Label>
        <span>Required</span>
      </Label>
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
