import { clsx, type ClassValue } from "clsx"
import { $createParagraphNode, $getSelection, LexicalEditor } from "lexical";
import { $setBlocksType } from '@lexical/selection';
import { twMerge } from "tailwind-merge"
import { $generateHtmlFromNodes } from '@lexical/html';
import { API_URL } from "./constants";
import type {  Options as PrettierOptions } from "prettier";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatParagraph = (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection();
    $setBlocksType(selection, () => $createParagraphNode());
  });
};

function formatHtmlForDocx(html: string): string {
  const formatted = html
    .replace(/>\s+</g, '><')
    .replace(/(<\/(?:div|p|h[1-6]|ul|ol|li|table|tr|td|th|blockquote|pre)>)/gi, '$1\n')
    .replace(/(<(?:div|p|h[1-6]|ul|ol|li|table|tr|td|th|blockquote|pre)[^>]*>)/gi, '\n$1')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  const lines = formatted.split('\n');
  let indent = 0;
  const indentSize = 2;
  
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - indentSize);
    }
    
    const indentedLine = ' '.repeat(indent) + trimmed;
    
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      const tagMatch = trimmed.match(/<(\w+)/);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        const blockElements = ['html', 'head', 'body', 'div', 'section', 'article', 'nav', 'aside', 'header', 'footer', 'main', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'blockquote', 'form', 'fieldset'];
        if (blockElements.includes(tagName)) {
          indent += indentSize;
        }
      }
    }
    
    return indentedLine;
  });
  
  return formattedLines.filter(line => line.trim()).join('\n');
}

type PrettierFormat = (source: string, options: PrettierOptions) => string | Promise<string>;
type PrettierParser = object;

const prettierCache: { format?: PrettierFormat; parser?: PrettierParser } = {};

async function loadPrettierSafely(): Promise<{ format: PrettierFormat | null; parser: PrettierParser | null }> {
  if (prettierCache.format && prettierCache.parser) {
    return { format: prettierCache.format, parser: prettierCache.parser ?? null };
  }

  try {
    const cdnSources = [
      'https://unpkg.com/prettier@3.0.0/standalone.mjs',
      'https://cdn.skypack.dev/prettier@3.0.0/standalone',
      'https://esm.sh/prettier@3.0.0/standalone'
    ];
    
    const parserSources = [
      'https://unpkg.com/prettier@3.0.0/plugins/html.mjs',
      'https://cdn.skypack.dev/prettier@3.0.0/plugins/html',
      'https://esm.sh/prettier@3.0.0/plugins/html'
    ];

    let prettier, parserHtml;
    
    for (let i = 0; i < cdnSources.length; i++) {
      try {
        prettier = await import(cdnSources[i]);
        parserHtml = await import(parserSources[i]);
        break;
      } catch (e) {
        if (i === cdnSources.length - 1) throw e;
        continue;
      }
    }

    prettierCache.format = prettier.format as PrettierFormat;
    prettierCache.parser = parserHtml.default || parserHtml;
    
    return { format: prettierCache.format, parser: prettierCache.parser ?? null };
  } catch (error) {
    console.warn('Failed to load Prettier from CDN, using fallback formatter:', error);
    return { format: null, parser: null };
  }
}

export const handleClick = async (editor: LexicalEditor, config: ConfigType, format: 'html' | 'docx') => {
  await editor.update(async () => {


    const htmlString = $generateHtmlFromNodes(editor, null);
    const compatibleHtml = await tailwindToInlineCSS(htmlString, config);


    if (format === 'html') {
      const blob = new Blob([compatibleHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.html';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'docx') {
      try {
        const response = await fetch(API_URL + '/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ compatibleHtml }),
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.docx';
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
    // Try Prettier first, fallback to custom formatter
    try {
      const { format, parser } = await loadPrettierSafely();
      if (format && parser) {
        return await format(convertedContent, {
          parser: "html",
          plugins: [parser],
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          htmlWhitespaceSensitivity: 'ignore'
        });
      }
    } catch (error) {
      console.warn('Prettier formatting failed, using fallback:', error);
    }
    
    // Fallback to custom formatter
    return formatHtmlForDocx(convertedContent);
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
        /* Basic document styles optimized for DOCX conversion */
        @page {
            size: A4;
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
        /* DOCX-friendly element styles */
        p { 
            margin: 0 0 1rem 0; 
            padding: 0;
        }
        h1, h2, h3, h4, h5, h6 { 
            margin: 1.5rem 0 0.5rem 0; 
            line-height: 1.2; 
            padding: 0;
        }
        ul, ol { 
            margin: 0 0 1rem 0; 
            padding-left: 2rem; 
        }
        li { 
            margin: 0 0 0.25rem 0; 
            padding: 0;
        }
        table { 
            margin: 1rem 0; 
            border-collapse: collapse; 
            width: 100%; 
        }
        th, td { 
            border: 1px solid #ccc; 
            padding: 8px; 
            text-align: left; 
            vertical-align: top;
        }
        blockquote { 
            margin: 1rem 0 1rem 2rem; 
            padding-left: 1rem; 
            border-left: 4px solid #ccc; 
            color: #666; 
        }
        hr { 
            margin: 2rem 0; 
            border: 0; 
            border-top: 1px solid #eee; 
        }
        code { 
            font-family: 'Courier New', Courier, monospace; 
            background-color: #f4f4f4; 
            padding: 2px 4px; 
            border-radius: 4px; 
        }
        pre { 
            background-color: #f4f4f4; 
            padding: 1rem; 
            border-radius: 4px; 
            overflow-x: auto; 
            white-space: pre-wrap;
        }
        /* Ensure images are responsive in DOCX */
        img {
            max-width: 100%;
            height: auto;
        }
        /* Better handling of inline elements */
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
        u { text-decoration: underline; }
        s, strike { text-decoration: line-through; }
    </style>
</head>
<body>
<div class="page">
${convertedContent}
</div>
</body>
</html>`;

  // Try Prettier first, fallback to custom formatter
  try {
    const { format, parser } = await loadPrettierSafely();
    if (format && parser) {
      return await format(finalHtml, {
        parser: "html",
        plugins: [parser],
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        htmlWhitespaceSensitivity: 'ignore'
      });
    }
  } catch (error) {
    console.warn('Prettier formatting failed, using fallback:', error);
  }

  return formatHtmlForDocx(finalHtml);
}

function convertBgClass(className: string): string {
  const colorMap: { [key: string]: string } = {
    'bg-red-500': '#ef4444',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#10b981',
    'bg-yellow-500': '#eab308',
    'bg-purple-500': '#a855f7',
    'bg-pink-500': '#ec4899',
    'bg-gray-500': '#6b7280',
    'bg-orange-500': '#f97316',
    'bg-teal-500': '#14b8a6',
    'bg-indigo-500': '#6366f1',
    // Add more as needed
  };
  return colorMap[className] || 'transparent';
}