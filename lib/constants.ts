export enum RichTextAction {
  Bold = "bold",
  Italics = "italic",
  Underline = "underline",
  Strikethrough = "strikethrough",
  Highlight = "highlight",
  Code = "code",
  Undo = "undo",
  Redo = "redo",
}

import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaStrikethrough, 
  FaHighlighter 
} from "react-icons/fa6";
import { 
  CiTextAlignCenter, 
  CiTextAlignJustify, 
  CiTextAlignLeft, 
  CiTextAlignRight 
} from "react-icons/ci";
import { PiListBullets } from "react-icons/pi";
import { MdFormatListNumbered } from "react-icons/md";
import { BiUndo, BiRedo } from "react-icons/bi";

// Style options for the editor
export const stylesOptions = [
{ label: 'Normal', value: 'normal' },
{ label: 'Title', value: 'title' },
{ label: 'Subtitle', value: 'subtitle' },
{ label: 'Heading 1', value: 'heading1' },
{ label: 'Heading 2', value: 'heading2' },
{ label: 'Heading 3', value: 'heading3' },
{ label: 'Quote', value: 'quote' },
{ label: 'Code Block', value: 'code' }
];

// Font family options
export const fontFamilyOptions = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
];

// Font size options
export const fontSizeOptions = [
{ label: '8pt', value: '8pt' },
{ label: '10pt', value: '10pt' },
{ label: '12pt', value: '12pt' }, // Default (index 2)
{ label: '14pt', value: '14pt' },
{ label: '16pt', value: '16pt' },
{ label: '18pt', value: '18pt' },
{ label: '20pt', value: '20pt' },
{ label: '24pt', value: '24pt' },
{ label: '26pt', value: '26pt' }
];

// Line height options
export const lineHeightOptions = [
{ label: '1.0', value: '1.0' },
{ label: '1.15', value: '1.15' },
{ label: '1.5', value: '1.5' }, // Default (index 2)
{ label: '2.0', value: '2.0' },
// { label: 'Custom', value: 'custom' }
];

// Text formatting actions with icons for iteration
export const textFormatActions = [
{ 
  action: 'bold', 
  icon: FaBold, 
  label: 'Bold',
  key: 'Bold' // corresponds to RichTextAction enum
},
{ 
  action: 'italic', 
  icon: FaItalic, 
  label: 'Italic',
  key: 'Italics' // corresponds to RichTextAction enum
},
{ 
  action: 'underline', 
  icon: FaUnderline, 
  label: 'Underline',
  key: 'Underline'
},
{ 
  action: 'strikethrough', 
  icon: FaStrikethrough, 
  label: 'Strikethrough',
  key: 'Strikethrough'
},
{ 
  action: 'highlight', 
  icon: FaHighlighter, 
  label: 'Highlight',
  key: 'Highlight'
}
];

// Text alignment options with icons for iteration
export const alignmentOptions = [
{ 
  alignment: 'left', 
  icon: CiTextAlignLeft, 
  label: 'Align Left' 
},
{ 
  alignment: 'center', 
  icon: CiTextAlignCenter, 
  label: 'Align Center' 
},
{ 
  alignment: 'right', 
  icon: CiTextAlignRight, 
  label: 'Align Right' 
},
{ 
  alignment: 'justify', 
  icon: CiTextAlignJustify, 
  label: 'Justify' 
}
];

// List options with icons for iteration
export const listOptions = [
{ 
  type: 'unordered', 
  icon: PiListBullets, 
  label: 'Bullet List', 
  command: 'INSERT_UNORDERED_LIST_COMMAND' 
},
{ 
  type: 'ordered', 
  icon: MdFormatListNumbered, 
  label: 'Numbered List', 
  command: 'INSERT_ORDERED_LIST_COMMAND' 
}
];

// Undo/Redo actions for iteration
export const undoRedoActions = [
{
  action: 'undo',
  icon: BiUndo,
  label: 'Undo',
  command: 'UNDO_COMMAND'
},
{
  action: 'redo',
  icon: BiRedo,
  label: 'Redo',
  command: 'REDO_COMMAND'
}
];

// Font mapping for Tailwind classes
export const fontFamilyMap = {
'inter': 'font-inter',
'arial': 'font-arial',
'georgia': 'font-georgia',
'times-new-roman': 'font-times',
'roboto': 'font-roboto',
'courier-new': 'font-mono'
};

// Font size mapping for Tailwind classes
export const fontSizeMap = {
'8pt': 'text-xs',
'10pt': 'text-sm',
'12pt': 'text-base',
'14pt': 'text-lg',
'16pt': 'text-xl',
'18pt': 'text-xl',
'20pt': 'text-2xl',
'24pt': 'text-3xl',
'26pt': 'text-4xl'
};

// Line height mapping for Tailwind classes
export const lineHeightMap = {
'1.0': 'leading-none',
'1.15': 'leading-tight',
'1.5': 'leading-relaxed',
'2.0': 'leading-loose',
'custom': 'leading-normal'
};