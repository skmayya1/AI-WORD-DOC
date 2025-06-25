import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { LexicalEditor } from 'lexical';
import { $getRoot } from 'lexical';

// Export current editor content as markdown
export function inMarkdown(editor: LexicalEditor): string {
  let markdown = '';
  editor.update(() => {
    markdown = $convertToMarkdownString(TRANSFORMERS);
  });
  return markdown;
}

// Update editor content from markdown string
export function updateEditorFromMarkdown(editor: LexicalEditor, markdownContent: string): void {
  editor.update(() => {
    // Clear existing content
    const root = $getRoot();
    root.clear();
    
    // Convert markdown to lexical nodes and insert
    $convertFromMarkdownString(markdownContent, TRANSFORMERS);
  });
}

// // Alternative version that preserves editor state better
// export function updateEditorFromMarkdownSafe(editor: LexicalEditor, markdownContent: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     editor.update(
//       () => {
//         try {
//           // Get the root node
//           const root = $getRoot();
          
//           // Clear existing content
//           root.clear();
          
//           // Convert and insert new content
//           $convertFromMarkdownString(markdownContent, TRANSFORMERS);
          
//           resolve();
//         } catch (error) {
//           reject(error);
//         }
//       },
//       {
//         onUpdate: () => {
//           // Optional: callback when update is complete
//           console.log('Editor updated with new markdown content');
//         },
//         skipTransforms: false, // Allow transforms to run
//       }
//     );
//   });
// }

// // Check if markdown content is different from current editor content
// export function isMarkdownDifferent(editor: LexicalEditor, newMarkdown: string): boolean {
//   const currentMarkdown = inMarkdown(editor);
//   return currentMarkdown.trim() !== newMarkdown.trim();
// }

// // Append markdown content to existing content
// export function appendMarkdownToEditor(editor: LexicalEditor, markdownToAppend: string): void {
//   editor.update(() => {
//     const root = $getRoot();
    
//     // Get current content
//     const currentMarkdown = $convertToMarkdownString(TRANSFORMERS);
    
//     // Combine with new content
//     const combinedMarkdown = currentMarkdown + '\n\n' + markdownToAppend;
    
//     // Clear and update
//     root.clear();
//     $convertFromMarkdownString(combinedMarkdown, TRANSFORMERS);
//   });
// }

// // Replace specific section in editor (useful for targeted edits)
// export function replaceMarkdownSection(
//   editor: LexicalEditor, 
//   oldSection: string, 
//   newSection: string
// ): boolean {
//   const currentMarkdown = inMarkdown(editor);
  
//   if (!currentMarkdown.includes(oldSection)) {
//     return false; // Section not found
//   }
  
//   const updatedMarkdown = currentMarkdown.replace(oldSection, newSection);
//   updateEditorFromMarkdown(editor, updatedMarkdown);
//   return true;
// }

// // Insert markdown at cursor position (if possible)
// export function insertMarkdownAtCursor(editor: LexicalEditor, markdownToInsert: string): void {
//   editor.update(() => {
//     // Convert markdown to nodes
//     $convertFromMarkdownString(markdownToInsert, TRANSFORMERS);
//   });
// }