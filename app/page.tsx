"use client"
import Chat from '@/components/Chat'
import Menu from '@/components/Menu'
import WordsViewer from '@/components/WordsDoc'
import theme from '@/themes'
import { ListItemNode, ListNode } from '@lexical/list'
import React from 'react'
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { EditorProvider } from '@/contexts/EditorContext'
import { ModalProvider } from '@/contexts/ModelContext'
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ChatProvider } from '@/contexts/ChatContext'

const page = () => {
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
      // PageBreakNode
    ],
  };
  return (
    <div className='h-screen overflow-hidden w-full flex items-center justify-center bg-zinc-200 py-3 gap-3'>
      <LexicalComposer initialConfig={initialConfig}>
        <EditorProvider>
          <ChatProvider>
            <ModalProvider>
              <WordsViewer />
              <div className="h-full w-[20%] flex flex-col gap-2">
                <Menu />
                <Chat />
              </div>
            </ModalProvider>
          </ChatProvider>
        </EditorProvider>
      </LexicalComposer>

    </div>
  )
}

export default page