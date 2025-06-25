import { inMarkdown, updateEditorFromMarkdown } from '@/ai-editor/Markdown';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useEditorContext } from './EditorContext';
import axios from 'axios';
import { API_URL } from '@/lib/constants';

export interface Message {
    role: 'agent' | 'human';
    content: string;
    isGenerating: boolean
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
    isGenerating: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [input, setInput] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const { editor } = useEditorContext();

    const activeChat = chats.find(chat => chat.id === activeChatId) || null;

    const createNewChat = () => {
        if (chats.length >= 6) return;
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
            const remainingChats = chats.filter(chat => chat.id !== id);
            setActiveChatId(remainingChats[0]?.id || null);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = { role: 'human', content: input.trim(), isGenerating: true };
        let currentChat: Chat;

        // Create new chat or update existing one with user message
        if (!activeChat) {
            if (chats.length >= 6) return;
            currentChat = {
                id: Date.now().toString(),
                messages: [userMessage],
                tabName: userMessage.content.split(' ').slice(0, 3).join(' ') || 'New Chat'
            };
            setChats(prev => [...prev, currentChat]);
            setActiveChatId(currentChat.id);
        } else {
            currentChat = {
                ...activeChat,
                messages: [...activeChat.messages, userMessage]
            };
            setChats(prev => prev.map(chat =>
                chat.id === activeChatId ? currentChat : chat
            ));
        }

        // Clear input and set generating state
        setInput('');
        setIsGenerating(true);

        try {
            // Get current document content
            const currentContext = inMarkdown(editor);


            const response = await axios.post(API_URL + '/api/agent', {
                context: currentContext,
                chat: currentChat
            }, {
                withCredentials: true
            });

            const { response: aiResponse, updatedContent } = response.data;

            const agentMessage: Message = {
                role: 'agent',
                content: aiResponse || "I've processed your request.",
                isGenerating: false
            };

            // Update the chat with agent response
            setChats(prev => prev.map(chat => {
                if (chat.id !== currentChat.id) return chat;
                return {
                    ...chat,
                    messages: [...chat.messages, agentMessage],
                    tabName: chat.messages.length === 0
                        ? (aiResponse?.split(' ').slice(0, 3).join(' ') || 'New Chat')
                        : chat.tabName
                };
            }));

            if (updatedContent && updateEditorFromMarkdown) {
                updateEditorFromMarkdown(editor, updatedContent);
            }

        } catch (error) {
            console.error('Error sending message:', error);

            // Add error message to chat
            const errorMessage: Message = {
                role: 'agent',
                content: "Sorry, there was an error processing your request. Please check your API key and try again.",
                isGenerating: false
            };

            setChats(prev => prev.map(chat => {
                if (chat.id !== currentChat.id) return chat;
                return {
                    ...chat,
                    messages: [...chat.messages, errorMessage]
                };
            }));
        } finally {
            setIsGenerating(false);
            // Ensure isGenerating is false for all messages in the active chat immutably
            if (currentChat) {
                setChats(prev => prev.map(chat => {
                    if (chat.id !== currentChat.id) return chat;
                    return {
                        ...chat,
                        messages: chat.messages.map(m => ({ ...m, isGenerating: false }))
                    };
                }));
            }
        }
    };

    return (
        <ChatContext.Provider value={{
            input,
            setInput,
            chats,
            activeChat,
            handleSendMessage,
            createNewChat,
            switchChat,
            deleteChat,
            isGenerating
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