import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '../modal';

describe('Modal', () => {
  it('renders modal when open', () => {
    render(
      <Modal open={true} onOpenChange={() => {}}>
        <div>Modal content</div>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal open={false} onOpenChange={() => {}}>
        <div>Hidden content</div>
      </Modal>
    );
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} className="custom-modal">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders modal overlay', () => {
    render(
      <Modal open={true} onOpenChange={() => {}}>
        <div data-testid="content">Content</div>
      </Modal>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders with title when provided', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Test Title">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
