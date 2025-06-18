// components/ReportViewer.tsx
"use client";

import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import React, { useEffect, useRef, useState } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { $createParagraphNode, $getRoot } from 'lexical';
// import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import PageBreakPlugin from '@/plugins/PageBreakPlugin';

const A4_SIZEPX = {
  HEIGHT: 1123,
  WIDTH: '794px'
}

interface RichTextEditorProps { }

const ReportViewer: React.FC<RichTextEditorProps> = () => {
  const { margins, editor } = useEditorContext();
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    const checkContentHeight = () => {

      const contentElement = editorRef.current
      if (contentElement) {
        const contentHeight = contentElement.scrollHeight;
        const pageHeight = A4_SIZEPX.HEIGHT;

        if (contentHeight >= pageHeight) {
          console.log(contentHeight,pageHeight);
          return true;
        }
      }
      return false;
    };

    const unregisterUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        checkContentHeight();
      });
    });

    return () => {
      unregisterUpdateListener();
    };
  }, [editor]);

  return (
    <div className="mx-auto my-14 flex flex-col items-center gap-24">
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            ref={editorRef}
            style={{
              paddingLeft: margins.left * 96,
              paddingRight: margins.right * 96,
              paddingTop: margins.top * 96,
              paddingBottom: margins.bottom * 96,
            }}
            className={`select-text outline-0 w-[794px] editor z-0  bg-white min-h-[1123px]`}
          />

        }
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />

      <HistoryPlugin />
      <ListPlugin hasStrictIndent />
      <AutoFocusPlugin />
      <PageBreakPlugin />
    </div>
  );
}

export default ReportViewer;