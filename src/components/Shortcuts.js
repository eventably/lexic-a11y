// Shortcuts.js
import React from 'react';
import { useTranslation } from 'react-i18next';

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
const modKey = isMac ? 'Cmd' : 'Ctrl';

const shortcuts = [
  { keys: [modKey, 'B'], descriptionKey: 'shortcutBold' },
  { keys: [modKey, 'I'], descriptionKey: 'shortcutItalic' },
  { keys: [modKey, 'U'], descriptionKey: 'shortcutUnderline' },
  { keys: [modKey, 'K'], descriptionKey: 'shortcutLink' },
  { keys: [modKey, 'Shift', '8'], descriptionKey: 'shortcutBulletList' },
  { keys: [modKey, 'Shift', '7'], descriptionKey: 'shortcutNumberedList' },
  { keys: [modKey, 'Alt', '1'], descriptionKey: 'shortcutHeading1' },
  { keys: [modKey, 'Alt', '2'], descriptionKey: 'shortcutHeading2' },
  { keys: [modKey, 'Alt', '3'], descriptionKey: 'shortcutHeading3' },
  { keys: [modKey, 'Alt', '4'], descriptionKey: 'shortcutHeading4' },
  { keys: [modKey, 'Alt', '5'], descriptionKey: 'shortcutHeading5' },
  { keys: [modKey, 'Alt', '6'], descriptionKey: 'shortcutHeading6' },
  { keys: ['Esc'], descriptionKey: 'shortcutEscape' },
];

export function Shortcuts() {
  const { t } = useTranslation();

  return (
    <ul>
      {shortcuts.map((shortcut, index) => (
        <li key={index} className="shortcut-item">
          <span className="shortcut-keys">
            {shortcut.keys.map((key, keyIndex) => (
              <React.Fragment key={keyIndex}>
                {keyIndex > 0 && (
                  <span className="key-separator" aria-hidden="true">+</span>
                )}
                <kbd aria-label={key}>{key}</kbd>
              </React.Fragment>
            ))}
          </span>
          <span className="shortcut-description" aria-hidden="true">
            : {t(shortcut.descriptionKey)}
          </span>
          <span className="sr-only">
            {shortcut.keys.join(' plus ')} for {t(shortcut.descriptionKey)}
          </span>
        </li>
      ))}
    </ul>
  );
}
