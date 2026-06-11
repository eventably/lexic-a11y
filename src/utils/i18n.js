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
        insertHorizontalRule: 'Insert Horizontal Rule',
        uploadImage: 'Upload Image',
        insertImage: 'Insert Image',
        insertTable: 'Insert Table',
        addRow: 'Add Row',
        addColumn: 'Add Column',
        deleteRow: 'Delete Row',
        deleteColumn: 'Delete Column',
        deleteTable: 'Delete Table',
        tableTools: 'Table Tools',
        editorToolbar: 'Editor Toolbar',
        editorContent: 'Editor content',
        bulletList: 'Bullet List',
        numberedList: 'Numbered List',
        showHelp: 'Show Help',
        enterUrl: 'Enter URL',
        enterImageUrl: 'Enter image URL',
        enterAltText: 'Enter alt text',
        // New translations for link dialog
        insertLink: 'Insert Link',
        url: 'URL',
        text: 'Text',
        linkText: 'Link Text',
        cancel: 'Cancel',
        insert: 'Insert',
        // Document outline / heading validation
        documentOutline: 'Document Outline',
        outlineEmpty: 'No headings yet. Headings appear here as you add them.',
        outlineUntitled: '(untitled heading)',
        headingWarningPrefix: 'Warning',
        headingSkippedLevel: 'Heading level skipped: {{from}} is followed by {{to}}',
        headingMultipleH1: 'Multiple H1 headings found ({{count}})',
        // Live word/character count
        wordCount_one: '{{count}} word',
        wordCount_other: '{{count}} words',
        charCount_one: '{{count}} character',
        charCount_other: '{{count}} characters',
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
