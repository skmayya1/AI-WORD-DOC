"use client";

import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import React, { useRef } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
// import PageTools from './PageTools';
import PageBreakPlugin from '@/plugins/PageBreakPlugin';
import { usePagination } from '@/hooks/Pagination';
// import { PageBackgrounds } from './PageBackground';



const ReportViewer= () => {
  const { margins, editor } = useEditorContext();
  const editorRef = useRef<HTMLDivElement | null>(null);
  
  const { isRecalculating } = usePagination(editor, margins);

  return (
    <div className="mx-auto relative my-10 flex items-start justify-center min-h-screen">
      {/* Fixed page tools */}
      <div className="fixed bottom-5 z-50">
        {/* <PageTools /> */}
      </div>

      {/* Main editor container */}
      <div className="relative">
        {/* Page backgrounds */}
        {/* <PageBackgrounds pages={pages} /> */}
        
        {/* Loading indicator */}
        {isRecalculating && (
          <div className="absolute top-4 ri ght-4 z-10 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            Calculating pages...
          </div>
        )}

        {/* Editor */}
        <div className="relative z-20">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                ref={editorRef}
                className="editor-content select-text outline-0 w-[794px] min-h-[1123px] bg-transparent "
                style={{
                  paddingLeft: margins.left * 96,
                  paddingRight: margins.right * 96,
                  paddingTop: margins.top * 96,
                  paddingBottom: margins.bottom * 96,
                }}
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
      </div>
    </div>
  );
};

export default ReportViewer;