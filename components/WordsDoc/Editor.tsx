// components/ReportViewer.tsx
"use client";

import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';


import { useFile } from '@/contexts/FileContexts';
import React from 'react';


interface RichTextEditorProps {}

const ReportViewer: React.FC<RichTextEditorProps> = () => {
  return (
    <div className="w-[794px] h-[1123px] bg-white mx-auto my-14">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="select-text outline-0 h-full w-full overflow-hidden editor z-0 border" />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin hasStrictIndent/>
        <AutoFocusPlugin/>
    </div>
  );
}

export default ReportViewer;
