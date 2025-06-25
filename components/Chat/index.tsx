import React from 'react'
import Input from './Input'
// import Tabs from './Tabs'
import Header from './Header'
import { useChat } from '@/contexts/ChatContext'
import ChatDrop from './ChatDrop'

const Chat: React.FC = () => {
  const { chats, activeChat } = useChat()
  const newHere = chats.length === 0;
  console.log(activeChat);

  return (
    <div className='w-full h-full rounded-lg bg-white py-2 px-2 flex flex-col relative'>
      {!newHere && (
        <div className="w-full flex-shrink-0 transition-all duration-400 ease-out">
          <Header />
        </div>
      )}

      <div className={`w-full flex-1 h-fit overflow-y-auto overflow-x-hidden scrollbar-thin  ${newHere ? 'flex items-center justify-center absolute bottom-100' : ''
        }`}>
        {activeChat && activeChat.messages.length > 0 ? (
          <div className="w-full space-y-4 px-2 py-5">
            {activeChat.messages.map((msg, idx) => (
              <ChatDrop
                key={`${activeChat.id}-${idx}`}
                message={msg.content}
                type={msg.role}
                isGenerating={idx === activeChat.messages.length - 2}
              />
            ))}
          </div>
        ) : newHere ? (
          <div className="text-center text-gray-500 select-none">
          <p>Start writing your document !</p>
          <p className="text-sm text-gray-400">Click anywhere or use AI to begin drafting</p>
        </div>
        
        ) : null}
      </div>

      <div className={`w-full flex-shrink-0 transition-all duration-300 ease-out`}>
        <div className={newHere ? 'w-full max-w-2xl' : 'w-full'}>
          <Input />
        </div>
      </div>
    </div>
  )
}

export default Chat