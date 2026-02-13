// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underline',
        strikethrough: 'Strikethrough',
        heading1: 'H1',
        heading2: 'H2',
        heading3: 'H3',
        heading4: 'H4',
        heading5: 'H5',
        heading6: 'H6',
        horizontalRule: 'HR',
        link: 'Link',
        uploadImage: 'Upload Image',
        insertImage: 'Insert Image',
        insertTable: 'Insert Table',
        addRow: 'Add Row',
        addColumn: 'Add Column',
        deleteRow: 'Delete Row',
        deleteColumn: 'Delete Column',
        deleteTable: 'Delete Table',
        editorToolbar: 'Editor Toolbar',
        enterUrl: 'Enter URL',
        enterImageUrl: 'Enter image URL',
        enterAltText: 'Enter alt text',
        // Link dialog
        insertLink: 'Insert Link',
        url: 'URL',
        text: 'Text',
        linkText: 'Link Text',
        cancel: 'Cancel',
        insert: 'Insert',
        // Editor labels and descriptions
        editorTitle: 'Text Editor',
        editorDescription: 'Use Tab to reach the toolbar, then arrow keys to navigate between buttons. Press Tab again to enter the editing area. Use keyboard shortcuts for formatting.',
        editorContentArea: 'Editor content area',
        showHelp: 'Show keyboard shortcuts help',
        editorShortcutsTitle: 'Editor Shortcuts',
        // List labels
        bulletList: 'Bullet List',
        numberedList: 'Numbered List',
        // Shortcut descriptions
        shortcutBold: 'Bold',
        shortcutItalic: 'Italic',
        shortcutUnderline: 'Underline',
        shortcutLink: 'Insert Link',
        shortcutBulletList: 'Bullet List',
        shortcutNumberedList: 'Numbered List',
        shortcutHeading1: 'Heading 1',
        shortcutHeading2: 'Heading 2',
        shortcutHeading3: 'Heading 3',
        shortcutHeading4: 'Heading 4',
        shortcutHeading5: 'Heading 5',
        shortcutHeading6: 'Heading 6',
        shortcutEscape: 'Exit editor focus',
        // Usage tips
        usageTips: 'Usage Tips',
        usageTipsDescription: 'Use the toolbar buttons or keyboard shortcuts to format your content.',
      },
    },
    // Additional languages can be added here.
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
