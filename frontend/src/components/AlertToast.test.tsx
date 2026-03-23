import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AlertToast from './AlertToast';
import { useTradingStore } from '../store/useTradingStore';

// Mock the store hook
vi.mock('../store/useTradingStore', () => ({
  useTradingStore: vi.fn(),
}));

describe('AlertToast', () => {
  it('should render triggered alerts', () => {
    const mockAlerts = [
      {
        toastId: 'toast-1',
        ticker: 'AAPL',
        condition: 'above',
        threshold: 150,
        price: 155,
        time: new Date().toISOString(),
      },
    ];

    (useTradingStore as any).mockReturnValue({
      triggeredAlerts: mockAlerts,
      dismissTriggeredAlert: vi.fn(),
    });

    render(<AlertToast />);

    expect(screen.getByText(/AAPL/)).toBeInTheDocument();
    expect(screen.getByText(/Above/)).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/155/)).toBeInTheDocument();
  });

  it('should call dismissTriggeredAlert when close button is clicked', () => {
    const mockDismiss = vi.fn();
    const mockAlerts = [
      {
        toastId: 'toast-1',
        ticker: 'TSLA',
        condition: 'below',
        threshold: 200,
        price: 195,
        time: new Date().toISOString(),
      },
    ];

    (useTradingStore as any).mockReturnValue({
      triggeredAlerts: mockAlerts,
      dismissTriggeredAlert: mockDismiss,
    });

    render(<AlertToast />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockDismiss).toHaveBeenCalledWith('toast-1');
  });

  it('should render nothing if there are no triggered alerts', () => {
    (useTradingStore as any).mockReturnValue({
      triggeredAlerts: [],
      dismissTriggeredAlert: vi.fn(),
    });

    const { container } = render(<AlertToast />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
