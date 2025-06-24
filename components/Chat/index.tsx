import React from 'react'
import Input from './Input'
// import Tabs from './Tabs'
import Header from './Header'
import { useChat } from '@/contexts/ChatContext'
import { transform } from 'next/dist/build/swc/generated-native'

const Chat: React.FC = () => {
  const { chats } = useChat()
  const newHere = chats.length === 0;
  
  return (
    <div className='w-full h-full rounded-lg bg-white py-2 px-2 flex flex-col relative overflow-hidden'>
      {/* Header container with smooth slide-down animation */}
      <div 
        className={`w-full transition-all duration-400 ease-out transform overflow-hidden ${
          !newHere 
            ? 'translate-y-0 ' 
            : '-translate-y-10'
        }`}
      >
        <Header />
      </div>
      
      {/* Flexible spacer that adjusts based on state */}
      <div className={`w-full transition-all duration-600 ease-out ${newHere ? 'flex-1' : 'flex-grow'}`}>
        {/* This area can contain chat messages when they exist */}
      </div>
      
      {/* Input container with smooth position transition */}
      <div 
        className={`w-full transition-all duration-300 ease-out ${
          newHere ? 'transform -translate-y-185'
            : 'transform translate-y-0'
        }`}
      >
        <Input />
      </div>
    </div>
  )
}

export default Chat 