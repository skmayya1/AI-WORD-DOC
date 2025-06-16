"use client"
import Chat from '@/components/Chat'
import WordsViewer from '@/components/WordsDoc'
import React from 'react'

const page = () => {
  return (
      <div className='h-screen overflow-hidden w-full flex items-center justify-center bg-zinc-200 py-3 gap-3'>
        <WordsViewer/>
        <Chat />
      </div>
  )
}

export default page