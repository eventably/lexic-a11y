import { act, fireEvent, render, screen } from '@testing-library/react';

import { TOOLTIP_DELAY_MS, useTooltip } from '../components/Tooltip';

// Minimal harness exercising the hook the way the toolbar uses it.
function Harness() {
  const { getTriggerProps, tooltip } = useTooltip();
  return (
    <div>
      <button type="button" {...getTriggerProps('bold', 'Bold (Ctrl+B)')}>
        B
      </button>
      {tooltip}
    </div>
  );
}

describe('useTooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it('does not show a tooltip before the delay elapses', () => {
    render(<Harness />);
    fireEvent.focus(screen.getByRole('button'));

    act(() => jest.advanceTimersByTime(TOOLTIP_DELAY_MS - 1));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the tooltip on focus after the delay and links it via aria-describedby', () => {
    render(<Harness />);
    const button = screen.getByRole('button');
    fireEvent.focus(button);

    act(() => jest.advanceTimersByTime(TOOLTIP_DELAY_MS));

    const tip = screen.getByRole('tooltip');
    expect(tip).toHaveTextContent('Bold (Ctrl+B)');
    expect(button).toHaveAttribute('aria-describedby', tip.id);
  });

  it('shows the tooltip on hover after the delay', () => {
    render(<Harness />);
    fireEvent.mouseEnter(screen.getByRole('button'));

    act(() => jest.advanceTimersByTime(TOOLTIP_DELAY_MS));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides the tooltip on blur and removes aria-describedby', () => {
    render(<Harness />);
    const button = screen.getByRole('button');
    fireEvent.focus(button);
    act(() => jest.advanceTimersByTime(TOOLTIP_DELAY_MS));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(button).not.toHaveAttribute('aria-describedby');
  });

  it('dismisses the tooltip on Escape (WAI-ARIA tooltip pattern)', () => {
    render(<Harness />);
    const button = screen.getByRole('button');
    fireEvent.focus(button);
    act(() => jest.advanceTimersByTime(TOOLTIP_DELAY_MS));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('cancels a pending tooltip if the pointer leaves before the delay', () => {
    render(<Harness />);
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    act(() => jest.advanceTimersByTime(TOOLTIP_DELAY_MS - 50));
    fireEvent.mouseLeave(button);
    act(() => jest.advanceTimersByTime(100));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
