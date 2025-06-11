import { SelectOption } from "@/components/DropDown";

export const stylesOptions: SelectOption[] = [
    { label: "Normal", value: "normal" },
    { label: "Title", value: "title" },
    { label: "Subtitle", value: "subtitle" },
    { label: "Heading 1", value: "heading1" },
    { label: "Heading 2", value: "heading2" },
    { label: "Heading 3", value: "heading3" },
    { label: "Quote", value: "quote" },
    { label: "Code", value: "code" },
  ];

  export const lineHeightOptions = [
    { label: 'Single', value: '1.0' },
    { label: '1.15', value: '1.15' },
    { label: '1.5', value: '1.5' },
    { label: 'Double', value: '2.0' },
    { label: 'Custom', value: 'custom' }
];

  export const fontFamilyOptions: SelectOption[] = [
    { label: "Inter", value: "inter" },
    { label: "Arial", value: "arial" },
    { label: "Georgia", value: "georgia" },
    { label: "Times New Roman", value: "times-new-roman" },
    { label: "Roboto", value: "roboto" },
    { label: "Courier New", value: "courier-new" }, // for code blocks
  ];
  

  export const fontSizeOptions: SelectOption[] = [
    { label: "8 pt", value: "8pt" },
    { label: "10 pt", value: "10pt" },
    { label: "12 pt (default)", value: "12pt" },
    { label: "14 pt", value: "14pt" },
    { label: "16 pt", value: "16pt" },
    { label: "18 pt", value: "18pt" },
    { label: "20 pt", value: "20pt" },
    { label: "24 pt", value: "24pt" },
    { label: "26 pt", value: "26pt" },
  ];

  
  export const lineSpacingOptions: SelectOption[] = [
    { label: "Single (1.0)", value: "1.0" },
    { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1.5" },
    { label: "Double (2.0)", value: "2.0" },
  ];
  