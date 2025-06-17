import React, { useState } from 'react'
import LexicalEditor from './Editor';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import ToolBar from './ToolBar';
import { EditorProvider } from '@/contexts/EditorContext';
import theme from '@/themes';
import { ModalProvider } from '@/contexts/ModelContext';


const WordsViewer = () => {
    const initialConfig = {
        namespace: 'ReportViewer',
        theme,
        onError(error: Error) {
            throw error;
        },
        editable: true,
        nodes: [
            ListNode,
            ListItemNode,
            HeadingNode,
            QuoteNode,
            CodeNode,
        ],
    };

    return (
        <div className="bg-[#fcfcfc] h-full w-[78.5%] rounded-lg border  relative overflow-hidden" >
            <LexicalComposer initialConfig={initialConfig}>
                <EditorProvider>
                    <ModalProvider>
                        <ToolBar />
                        <div className="overflow-auto scrollbar-thin h-full max-h-[93%] w-full py-4">
                            <LexicalEditor />
                            <div className="">

                            </div>
                        </div>
                    </ModalProvider>

                </EditorProvider>
            </LexicalComposer>
        </div>
    )
}

export default WordsViewer