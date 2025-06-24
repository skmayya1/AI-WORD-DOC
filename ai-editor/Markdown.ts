import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
  } from '@lexical/markdown';
import { LexicalEditor } from 'lexical';

  export async function inMarkdown(editor:LexicalEditor){
    let markdown;
    editor.update(() => {
         markdown = $convertToMarkdownString(TRANSFORMERS);
    });
    console.log(markdown);
    
  }