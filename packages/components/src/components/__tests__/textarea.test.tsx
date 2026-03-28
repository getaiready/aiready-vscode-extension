import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from '../textarea';

describe('Textarea', () => {
  it('renders textarea', () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveClass('custom-textarea');
  });

  it('renders as textarea element', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('accepts placeholder', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('has default styling', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full');
  });

  it('accepts rows prop', () => {
    render(<Textarea rows={5} data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '5');
  });
});
