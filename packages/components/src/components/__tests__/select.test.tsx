import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';

describe('Select', () => {
  it('renders select trigger', () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
  });

  it('renders trigger with custom className', () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger" data-testid="trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('trigger')).toHaveClass('custom-trigger');
  });

  it('trigger has button role', () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('trigger')).toHaveAttribute('role', 'combobox');
  });

  it('trigger has default styling', () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveClass('flex', 'h-10', 'w-full');
  });

  it('SelectTrigger is disabled when disabled prop is true', () => {
    render(
      <Select disabled>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('trigger')).toBeDisabled();
  });
});
