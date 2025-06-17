// components/ReportViewer.tsx
"use client";

import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import PageBreakPlugin from '@/plugins/PageBreakPlugin';

import React, { JSX } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';

interface RichTextEditorProps {}

const ReportViewer: React.FC<RichTextEditorProps> = () => {
  const { margins } =useEditorContext()
  return (
    <div className="w-[794px] h-[1123px] bg-white mx-auto my-14">
        <RichTextPlugin
          contentEditable={
            <ContentEditable style={{
              paddingLeft:margins.left * 96,
              paddingRight:margins.right* 96,
              paddingTop:margins.top* 96,
              paddingBottom:margins.bottom* 96
            }} className="select-text outline-0 h-full w-full overflow-hidden editor z-0 border" />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin hasStrictIndent/>
        <AutoFocusPlugin/>
        <PageBreakPlugin />
    </div>
  );
}

export default ReportViewer;

