import React, { useEffect, useRef } from 'react'
import Input from './Input'
import Header from './Header'
import { useChat } from '@/contexts/ChatContext'
import ChatDrop from './ChatDrop'

const Chat: React.FC = () => {
  const { chats, activeChat } = useChat()
  const newHere = chats.length === 0;

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChat?.messages?.length])

  return (
    <div className='w-full h-full max-h-[94%] rounded-lg bg-white py-2 px-2 flex flex-col relative'>
      {!newHere && (
        <div className="w-full flex-shrink-0 transition-all duration-400 ease-out">
          <Header />
        </div>
      )}

      {/* This div should take up all available space and be scrollable */}
      <div className={`w-full flex-1 min-h-0 max-h-[90%] overflow-y-auto overflow-x-hidden scrollbar-thin ${newHere ? 'absolute bottom-100' : ''}`}> 
        {activeChat && activeChat.messages.length > 0 ? (
          <div className="w-full space-y-4 px-2 py-5">
            {activeChat.messages.map((msg, idx) => (
              <ChatDrop
                key={`${activeChat.id}-${idx}`}
                message={msg.content}
                type={msg.role}
                isGenerating={msg.isGenerating}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        ) : newHere ? (
          <div className="text-center text-gray-500 select-none">
            <p>Start writing your document !</p>
            <p className="text-sm text-gray-400">Click anywhere or use AI to begin drafting</p>
          </div>
        ) : null}
      </div>

      <div className={`w-full flex-shrink-0 transition-all duration-300 ease-out`}>
        <div className={newHere ? 'w-full max-w-2xl mx-auto' : 'w-full'}>
          <Input />
        </div>
      </div>
    </div>
  )
}

export default Chat