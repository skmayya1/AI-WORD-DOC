import { LexicalCommand, createCommand } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes, $getSelection } from "lexical";
import { useEffect } from "react";
import { PageBreakNode, $createPageBreakNode } from "@/nodes/PageBreak";

export const INSERT_PAGE_BREAK: LexicalCommand<void> = createCommand("INSERT_PAGE_BREAK");

export default function PageBreakPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([PageBreakNode])) {
      editor.registerNodeTransform(PageBreakNode, () => {});
    }

    return editor.registerCommand(
      INSERT_PAGE_BREAK,
      () => {
        const selection = $getSelection();
        if (selection) {
          $insertNodes([$createPageBreakNode()]);
          return true;
        }
        return false;
      },
      0
    );
  }, [editor]);

  return null;
}
