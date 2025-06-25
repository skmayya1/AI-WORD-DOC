import React from 'react'

interface ChatDropProps {
    type: "agent" | "human"
    message: string
    isGenerating: boolean
}

const ChatDrop: React.FC<ChatDropProps> = ({
    message,
    type,
    isGenerating = false
}) => {
    return (
        <div className={`w-full flex mb-4 ${type === 'agent' ? 'justify-start' : 'justify-end'
            }`}>
            <div className={`
                relative w-[95%] p-3 rounded-lg flex flex-col gap-5
                ${type === 'human'
                    ? 'border border-zinc-200 rounded-md flex flex-wrap bg-[#F4F4F5]'
                    : 'border-0 bg-transparent'
                }
            `}>
                <div className="whitespace-pre-wrap break-words">
                    {message}
                </div>
                {isGenerating && type === 'human' && (
                    <div className="flex items-center  opacity-60">
                        <div className="flex gap-2 px-1 items-center">
                            <span className="text-xs text-gray-500 leading-none select-none">
                                generating
                            </span>
                            <div className="flex gap-1 items-center">
                                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatDrop