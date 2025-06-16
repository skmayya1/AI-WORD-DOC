import { clsx, type ClassValue } from "clsx"
import { $createParagraphNode, $getSelection, LexicalEditor } from "lexical";
import {  $setBlocksType } from '@lexical/selection';
import prettier from "prettier/standalone";
import parserHtml from "prettier/parser-html";

import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatParagraph = (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection();
    $setBlocksType(selection, () => $createParagraphNode());
  });
};

import { $generateHtmlFromNodes } from '@lexical/html';

export const handleClick = async (editor: LexicalEditor) => {
  await editor.update(async () => {
    const editorState = editor.getEditorState();
    const jsonString = JSON.stringify(editorState);
    console.log('jsonString', jsonString);
    const htmlString = $generateHtmlFromNodes(editor, null);
    const compatibleHtml = await tailwindToInlineCSS(htmlString)

    console.log('tw to inline', compatibleHtml);
    const blob = new Blob([compatibleHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test.html';
    a.click();
    URL.revokeObjectURL(url);
  });
};

export async function tailwindToInlineCSS(content: string) :Promise<string>{
  const convertedContent = content.replace(/class=["']([^"']+)["']/g, (_, classNames) => {
    const classes = classNames.split(/\s+/);
    let alignAttribute = '';
    let otherStyles = '';
    
    classes.forEach((className : string) => {
      switch(className) {
        case 'text-center':
          alignAttribute = 'align="center"';
          break;
        case 'text-left':
          alignAttribute = 'align="left"';
          break;
        case 'text-right':
          alignAttribute = 'align="right"';
          break;
        case 'text-justify':
          alignAttribute = 'align="justify"';
          break;
        default:
          if (className.startsWith('bg-')) {
            otherStyles += `background-color: ${convertBgClass(className)}; `;
          }
          break;
      }
    });
    
    let result = '';
    if (alignAttribute) {
      result += alignAttribute;
    }
    if (otherStyles) {
      result += ` style="${otherStyles.trim()}"`;
    }
    
    return result;
  });

  const hasHtmlStructure = /<html[^>]*>[\s\S]*<\/html>/i.test(convertedContent) || 
                          /<body[^>]*>[\s\S]*<\/body>/i.test(convertedContent);

  if (hasHtmlStructure) {
    return convertedContent;
  }

  
const finalHtml = hasHtmlStructure
? convertedContent
: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* Basic document styles */
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background-color: #fff;
        }
        /* Ensure proper spacing for document elements */
        p { margin: 0 0 1rem 0; }
        h1, h2, h3, h4, h5, h6 { margin: 1.5rem 0 0.5rem 0; line-height: 1.2; }
        ul, ol { margin: 0 0 1rem 0; padding-left: 2rem; }
        li { margin: 0 0 0.25rem 0; }
        table { margin: 1rem 0; }
        blockquote { margin: 1rem 0 1rem 2rem; }
        hr { margin: 2rem 0; }
        code { font-family: 'Courier New', Courier, monospace; }
    </style>
</head>
<body>
${convertedContent}
</body>
</html>`;


const formatted = await prettier.format(finalHtml, {
  parser: "html",
  plugins: [parserHtml],
});

return formatted
}

function convertBgClass(className: string): string {
  const colorMap: { [key: string]: string } = {
    'bg-red-500': '#ef4444',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#10b981',
  };
  return colorMap[className] || '#000';
}