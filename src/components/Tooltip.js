// Tooltip.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// A single shared tooltip element is reused for whichever trigger is active, so
// only one tooltip is ever visible and one id is enough for aria-describedby.
export const TOOLTIP_ID = 'editor-toolbar-tooltip';
export const TOOLTIP_DELAY_MS = 500;

/**
 * Toolbar tooltip controller.
 *
 * Returns spreadable trigger props plus the tooltip element to render. The
 * tooltip is a real element (role="tooltip"), not a `title` attribute, and
 * follows the WAI-ARIA tooltip pattern: it appears on hover *and* keyboard
 * focus after a short delay, and is dismissed on pointer-leave, blur, or
 * Escape. The active trigger points at it via aria-describedby so screen
 * readers announce the description too.
 *
 * Trigger DOM structure is left untouched (no wrapper element), so existing
 * toolbar layout and roving-tabindex queries keep working.
 *
 * @param {number} [delay] Milliseconds to wait before showing.
 * @returns {{ getTriggerProps: (key: string, text: string) => object, tooltip: React.ReactNode }}
 */
export function useTooltip(delay = TOOLTIP_DELAY_MS) {
  // { key, text, x, y } for the active tooltip, or null when hidden
  const [active, setActive] = useState(null);
  const timerRef = useRef(null);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActive(null);
  }, []);

  const show = useCallback(
    (key, text, element) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setActive({ key, text, x: rect.left + rect.width / 2, y: rect.bottom + 6 });
      }, delay);
    },
    [delay],
  );

  // Clear any pending timer if the toolbar unmounts mid-delay
  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  const getTriggerProps = useCallback(
    (key, text) => ({
      'aria-describedby': active && active.key === key ? TOOLTIP_ID : undefined,
      'onMouseEnter': (event) => show(key, text, event.currentTarget),
      'onMouseLeave': hide,
      'onFocus': (event) => show(key, text, event.currentTarget),
      'onBlur': hide,
      'onKeyDown': (event) => {
        if (event.key === 'Escape') hide();
      },
    }),
    [active, show, hide],
  );

  const tooltip = active
    ? createPortal(
        <div
          id={TOOLTIP_ID}
          role="tooltip"
          className="editor-tooltip"
          style={{ position: 'fixed', top: `${active.y}px`, left: `${active.x}px` }}
        >
          {active.text}
        </div>,
        document.body,
      )
    : null;

  return { getTriggerProps, tooltip };
}
