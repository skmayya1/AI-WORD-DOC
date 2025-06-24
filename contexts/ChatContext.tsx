import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
    role: 'agent' | 'human';
    content: string;
}

interface Chat {
    id: string;
    messages: Message[];
    tabName: string;
}

interface ChatContextType {
    input: string;
    setInput: (value: string) => void;
    chats: Chat[];
    activeChat: Chat | null;
    handleSendMessage: () => void;
    createNewChat: () => void;
    switchChat: (id: string) => void;
    deleteChat: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [input, setInput] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const activeChat = chats.find(chat => chat.id === activeChatId) || null;

    const createNewChat = () => {
        if (chats.length >= 6) return
        const newChat: Chat = {
            id: Date.now().toString(),
            messages: [],
            tabName: 'New Chat'
        };
        setChats(prev => [...prev, newChat]);
        setActiveChatId(newChat.id);
    };

    const switchChat = (id: string) => {
        setActiveChatId(id);
    };

    const deleteChat = (id: string) => {
        setChats(prev => prev.filter(chat => chat.id !== id));
        if (activeChatId === id) {
            setActiveChatId(chats[0]?.id || null);
        }
    };

    const handleSendMessage = () => {
        if (!input.trim()) return;


        if (!activeChat) createNewChat()



        const newMessage: Message = { role: 'human', content: input.trim() };
        const agentMessage: Message = { role: 'agent', content: "This is a sample response from the agent" };

        setChats(prev => prev.map(chat => {
            if (chat.id !== activeChatId) return chat;

            const updatedMessages = [...chat.messages, newMessage, agentMessage];
            return {
                ...chat,
                messages: updatedMessages,
                // Update tab name only if this is the first message
                tabName: chat.messages.length === 0
                    ? agentMessage.content.split(' ').slice(0, 2).join(' ')
                    : chat.tabName
            };
        }));

        setInput('');
    };

    // Create initial chat if none exists
    React.useEffect(() => {
        if (chats.length === 0) {
            createNewChat();
        }
    }, []);

    return (
        <ChatContext.Provider value={{
            input,
            setInput,
            chats,
            activeChat,
            handleSendMessage,
            createNewChat,
            switchChat,
            deleteChat
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
