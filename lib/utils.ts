import { clsx, type ClassValue } from "clsx"
import { $createParagraphNode, $getSelection, LexicalEditor } from "lexical";
import {  $setBlocksType } from '@lexical/selection';

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