import {
  // $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { LexicalEditor } from 'lexical';

export function inMarkdown(editor: LexicalEditor) {
  let markdown;
  editor.update(() => {
    markdown = $convertToMarkdownString(TRANSFORMERS);
  });
  return markdown
}


