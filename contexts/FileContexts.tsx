'use client';

import { ConvertToHtml } from '@/lib/mammoth';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Document {
    id: string;
    name: string;
    content: string | ArrayBuffer;
    type: string;
    lastModified: Date;
    size: number;
}

interface FileContextType {
    document: Document | null;
    isUploading: boolean;
    uploadDocument: (file: File | null) => Promise<void>;
    selectDocument: (document: Document) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
    const [document, setDocument] = useState<Document | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const uploadDocument = async (file: File | null) => {
        try {
            setIsUploading(true);
            
            if (!file) {
                const blankDocument: Document = {
                    id: crypto.randomUUID(),
                    name: 'Untitled Document',
                    content: '',
                    type: 'text/plain',
                    lastModified: new Date(),
                    size: 0
                };
                setDocument(blankDocument);
                return;
            }
           const buffer = await file.arrayBuffer()
           const content = await ConvertToHtml(buffer)

            const newDocument: Document = {
                id: crypto.randomUUID(),
                name: file.name,
                content: content.value,
                type: file.type,
                lastModified: new Date(file.lastModified),
                size: file.size
            };
            console.log(newDocument);
            
            setDocument(newDocument);
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const selectDocument = (document: Document) => {
        setDocument(document);
    };

    const value = {
        document,
        isUploading,
        uploadDocument,
        selectDocument,
    };

    return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}

export function useFile() {
    const context = useContext(FileContext);
    if (context === undefined) {
        throw new Error('useFile must be used within a FileProvider');
    }
    return context;
}