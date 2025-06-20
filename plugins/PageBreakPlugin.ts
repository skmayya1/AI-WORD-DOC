import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $getSelection, $insertNodes, COMMAND_PRIORITY_LOW, createCommand } from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';
import { useEffect } from 'react';

export default function PageBreakPlugin() {
  const [editor] = useLexicalComposerContext();

  const INSERT_PAGE_BREAK_COMMAND = createCommand('INSERT_PAGE_BREAK_COMMAND');

  useEffect(() => {
    return editor.registerCommand(
      INSERT_PAGE_BREAK_COMMAND,
      () => {
        const selection = $getSelection();
        if (selection) {
          const pageBreakNode = $createParagraphNode();
          pageBreakNode.setFormat('');
          
          // Add a data attribute to mark this as a page break
          editor.update(() => {
            $insertNodes([pageBreakNode]);
            
            // Set the page break attribute after insertion
            setTimeout(() => {
              const editorElement = document.querySelector('.editor-content');
              const paragraphs = editorElement?.querySelectorAll('p');
              if (paragraphs && paragraphs.length > 0) {
                const lastParagraph = paragraphs[paragraphs.length - 1] as HTMLElement;
                lastParagraph.dataset.pageBreak = 'true';
                lastParagraph.classList.add('page-break');
              }
            }, 0);
          });
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}