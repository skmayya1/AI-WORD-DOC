// plugins/PageBreakPlugin.tsx
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { $createPageBreakNode } from "@/nodes/PageBreak";

const A4_HEIGHT = 1123;

const PageBreakPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let alreadyInserted = false;

    const checkHeightAndInsertBreak = () => {
      const editorRoot = document.querySelector(".editor");
      if (!editorRoot) return;

      const height = editorRoot.scrollHeight;

      if (height > A4_HEIGHT && !alreadyInserted) {
        alreadyInserted = true;

        editor.update(() => {
          const root = $getRoot();
          root.append($createPageBreakNode());
        });
      }
    };

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        checkHeightAndInsertBreak();
      });
    });

    return () => unregister();
  }, [editor]);

  return null;
};

export default PageBreakPlugin;
