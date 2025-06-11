"use client"
import Chat from '@/components/Chat'
import WordsViewer from '@/components/WordsDoc'
import { FileProvider, useFile } from '@/contexts/FileContexts'
import React from 'react'

const page = () => {
  return (
    <FileProvider>
      <div className='h-screen overflow-hidden w-full flex items-center justify-center bg-zinc-200 py-3 gap-3'>
        <WordsViewer/>
        <Chat />
      </div>
    </FileProvider>
  )
}

export default page