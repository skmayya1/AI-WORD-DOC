import React from 'react'
import { IoMdSend } from "react-icons/io";
import { IoIosAdd } from "react-icons/io";
import { useChat } from '@/contexts/ChatContext';
// import { IoMdKey } from "react-icons/io";

const Input = () => {
    const { input, setInput, handleSendMessage } = useChat();

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className='w-full h-[120px] rounded-lg bg-zinc-100 border-silver/30 border p-2 px-3 py-5 flex flex-col items-center justify-between gap-2 '>
            {/* <div className="h-fit w-full flex items-center">
                <div className="bg-white text-[10px] flex items-center border border-silver/40 tracking-wide w-fit py-0.5 px-1 rounded-sm cursor-pointer text-eerie-black/70 hover:bg-white/70">
                    <span>
                        <IoIosAdd color='gray' size={12} />
                    </span> Template
                </div>
            </div> */}
            <div className="w-full h-full flex items-start justify-between gap-4">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder='Write, Generate, Edit anything' 
                    className='h-full w-full text-sm tracking-wide border-0 outline-0 resize-none bg-transparent scrollbar-thin ' 
                />
                <button 
                    onClick={handleSendMessage}
                    className="h-full flex items-start justify-center cursor-pointer hover:opacity-70 transition-opacity"
                >
                    <IoMdSend color='#022B3A' size={20} />
                </button>
            </div>
        </div>
    )
}

export default Input