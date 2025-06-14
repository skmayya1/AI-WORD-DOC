import { useFile } from '@/contexts/FileContexts'
import React, { useState } from 'react'
import { TfiUpload } from "react-icons/tfi";
import { AiOutlineLoading } from "react-icons/ai";
import LexicalEditor from './Editor';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { EditorThemeClasses } from 'lexical';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import ToolBar from './ToolBar';
import { EditorProvider } from '@/contexts/EditorContext';
import theme from '@/themes';


const WordsViewer = () => {
    const { isUploading, document, uploadDocument } = useFile()
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await uploadDocument(file);
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Failed to upload file. Please try again.');
            }
        }
        event.target.value = '';
    };

    const handleCreateBlankDocument = async () => {
        try {
            await uploadDocument(null);
        } catch (error) {
            console.error('Failed to create blank document:', error);
            alert('Failed to create document. Please try again.');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            try {
                await uploadDocument(file);
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Failed to upload file. Please try again.');
            }
        }
    };

    if (isUploading) {
        return (
            <div className="bg-white h-full w-[78.5%] rounded-lg border border-[#022B3A]/30 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <AiOutlineLoading className="animate-spin text-2xl text-dblue" />
                    <p className="text-sm text-gray-600">Loading document...</p>
                </div>
            </div>
        )
    }

    if (!document) {
        return (
            <div
                className={`bg-white h-full w-[78.5%] rounded-lg border-2    transition-colors ${dragActive ? 'border-lblue bg-lblue/5' : ''
                    } flex tracking-wider text-sm items-center justify-center gap-2`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex  items-center gap-4 p-8">
                    {dragActive ? (
                        <div className="flex flex-col items-center gap-3">
                            <TfiUpload size={24} color="blue" />
                            <p className="text-zinc-600 font-medium">Drop your file here</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCreateBlankDocument}
                                    className='text-dblue tracking-widest cursor-pointer underline hover:text-dblue/80 transition-colors'
                                >
                                    Create a blank document
                                </button>
                                <span className="text-gray-500">or</span>
                            </div>

                            <div>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".docx,.doc,.txt,.md,.json,.xml,.js,.ts,.jsx,.tsx,.html,.css,.pdf"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-upload" className='px-4 z-5 py-2 border rounded-2xl flex items-center justify-center gap-2 bg-lblue/40 cursor-pointer hover:bg-lblue/50 transition-all duration-150 ease-in-out text-sm font-medium'>
                                    <TfiUpload size={12} color='blue' />
                                    Upload an existing file
                                </label>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

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
        ],
    };

    return (
        <div className="bg-[#fcfcfc] h-full w-[78.5%] rounded-lg border  relative overflow-hidden" >
            <LexicalComposer initialConfig={initialConfig}>
                <EditorProvider>
                    <ToolBar />
                    <div className="overflow-auto scrollbar-thin h-full max-h-[93%] w-full py-4">
                        <LexicalEditor />
                    </div>
                </EditorProvider>
            </LexicalComposer>
        </div>
    )
}

export default WordsViewer