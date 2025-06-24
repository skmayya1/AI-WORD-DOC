import { clsx, type ClassValue } from "clsx"
import { $createParagraphNode, $getSelection, LexicalEditor } from "lexical";
import { $setBlocksType } from '@lexical/selection';
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
import { API_URL } from "./constants";

export const handleClick = async (editor: LexicalEditor, config: ConfigType, format: 'html' | 'docx') => {
  await editor.update(async () => {
    const editorState = editor.getEditorState();
    const jsonString = JSON.stringify(editorState);
    console.log('Lexical Editor State:', jsonString);

    const htmlString = $generateHtmlFromNodes(editor, null);
    const compatibleHtml = await tailwindToInlineCSS(htmlString, config); // Still useful for general HTML output/clean up

    console.log('HTML after Tailwind to Inline CSS:', compatibleHtml);

    if (format === 'html') {
      const blob = new Blob([compatibleHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.html'; // Changed filename
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'docx') {
      try {
        const response = await fetch(API_URL +'/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ compatibleHtml }),
        });
        const blob = await response.blob(); // Get the response as a Blob
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.docx'; // Changed filename
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading DOCX:', error);
        alert(`Error: ${(error as Error).message}`);
      }
    }
  });
};

export interface ConfigType {
  margins: {
    left: number
    right: number
    top: number
    bottom: number
  }
}

export async function tailwindToInlineCSS(content: string, config: ConfigType): Promise<string> {
  const convertedContent = content.replace(/class=["']([^"']+)["']/g, (_, classNames) => {
    const classes = classNames.split(/\s+/);
    let alignAttribute = '';
    let otherStyles = '';

    classes.forEach((className: string) => {
      switch (className) {
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
      if (result) {
        result += ' ';
      }
      result += `style="${otherStyles.trim()}"`;
    }

    return result;
  });

  const hasHtmlStructure = /<html[^>]*>[\s\S]*<\/html>/i.test(convertedContent) ||
    /<body[^>]*>[\s\S]*<\/body>/i.test(convertedContent);

  if (hasHtmlStructure) {
    const formatted = await prettier.format(convertedContent, {
      parser: "html",
      plugins: [parserHtml],
    });
    return formatted;
  }

  const { top, right, bottom, left } = config.margins;

  const marginTop = (top * 2.54).toFixed(2) + 'cm';
  const marginRight = (right * 2.54).toFixed(2) + 'cm';
  const marginBottom = (bottom * 2.54).toFixed(2) + 'cm';
  const marginLeft = (left * 2.54).toFixed(2) + 'cm';

  const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* Basic document styles */
        @page {
            size: A4; /* Or 21cm 29.7cm */
            margin-top: ${marginTop};
            margin-right: ${marginRight};
            margin-bottom: ${marginBottom};
            margin-left: ${marginLeft};
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #333;
            background-color: #fff;
        }
        /* Ensure proper spacing for document elements */
        p { margin: 0 0 1rem 0; }
        h1, h2, h3, h4, h5, h6 { margin: 1.5rem 0 0.5rem 0; line-height: 1.2; }
        ul, ol { margin: 0 0 1rem 0; padding-left: 2rem; }
        li { margin: 0 0 0.25rem 0; }
        table { margin: 1rem 0; border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        blockquote { margin: 1rem 0 1rem 2rem; padding-left: 1rem; border-left: 4px solid #ccc; color: #666; }
        hr { margin: 2rem 0; border: 0; border-top: 1px solid #eee; }
        code { font-family: 'Courier New', Courier, monospace; background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
        pre { background-color: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
<div class="page">
${convertedContent}
</div>
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
    // Add more Tailwind background colors and their hex values as needed
  };
  return colorMap[className] || 'transparent';
}