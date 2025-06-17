import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
    $getSelection, 
    $isRangeSelection, 
    CAN_REDO_COMMAND, 
    CAN_UNDO_COMMAND, 
    SELECTION_CHANGE_COMMAND, 
    ElementFormatType,
    KEY_BACKSPACE_COMMAND,
    KEY_ESCAPE_COMMAND,
    $getRoot,
    $isElementNode
} from 'lexical';
import { mergeRegister } from "@lexical/utils";
import { fontFamilyOptions, fontSizeOptions, lineHeightOptions, RichTextAction, stylesOptions } from '@/lib/constants';
import { $isListNode } from '@lexical/list';
import { ColorResult } from 'react-color';


interface EditorContextType {
    // Selection state
    selectionMap: { [id: string]: boolean };
    currAlignment: ElementFormatType;
    canUndo: boolean;
    canRedo: boolean;
    color:string;
    
    // Current settings
    currentListType:'ordered' | 'unordered' | null;
    currentStyle: string;
    currentFontFamily: string;
    currentFontSize: string;
    currentLineHeight: string;
    margins: { top: number; bottom: number; left: number; right: number };

    
    // Setters
    setCurrentStyle: (style: string) => void;
    setCurrentFontFamily: (family: string) => void;
    setCurrentListType: (type :'ordered' | 'unordered' | null) => void;
    setCurrentFontSize: (size: string) => void;
    setCurrentLineHeight: (height: string) => void;
    setCurrAlignment: (alignment: ElementFormatType) => void;
    setMargins: (margins: { top: number; bottom: number; left: number; right: number } | ((prev: any) => any)) => void;

    
    updateToolbar: () => void;
    changeColor: (color:ColorResult) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [editor] = useLexicalComposerContext();
    const [selectionMap, setSelectionMap] = useState<{ [id: string]: boolean }>({});
    const [currAlignment, setCurrAlignment] = useState<ElementFormatType>("left");
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [currentStyle, setCurrentStyle] = useState(stylesOptions[0].value);
    const [currentFontFamily, setCurrentFontFamily] = useState(fontFamilyOptions[3].value);
    const [currentFontSize, setCurrentFontSize] = useState(fontSizeOptions[2].value);
    const [currentLineHeight, setCurrentLineHeight] = useState(lineHeightOptions[2].value);
    const [currentListType, setCurrentListType] = useState<'ordered' | 'unordered' | null>(null)
    const [color, setcolor] = useState('#111111');
    const [margins, setMargins] = useState({
        top: 1.0,
        bottom: 1.0, 
        left: 1.0,
        right: 1.0
    });

    const changeColor = (color:ColorResult) =>{
        setcolor(color.hex)
    }

    const updateToolbar = () => {
        const selection = $getSelection();        
        if ($isRangeSelection(selection)) {
                const newSelectionMap = {
                [RichTextAction.Bold]: selection.hasFormat("bold"),
                [RichTextAction.Italics]: selection.hasFormat("italic"),
                [RichTextAction.Underline]: selection.hasFormat("underline"),
                [RichTextAction.Strikethrough]: selection.hasFormat("strikethrough"),
                [RichTextAction.Code]: selection.hasFormat("code"),
                [RichTextAction.Highlight]: selection.hasFormat("highlight"),
            };
            setSelectionMap(newSelectionMap);
        }
    };

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                    const root = $getRoot();
                    let hasList = false;
                    root.getChildren().forEach((node) => {
                        if ($isElementNode(node) && $isListNode(node)) {
                            hasList = true;
                        }
                    });
                    if (!hasList && currentListType !== null) {
                        setCurrentListType(null);
                    }
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (payload) => {
                    updateToolbar();
                    return false;
                },
                1
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                1
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                1
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                () => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const node = selection.anchor.getNode();
                        if ($isListNode(node)) {
                            // If we're at the start of a list item and pressing backspace
                            if (selection.anchor.offset === 0) {
                                setCurrentListType(null);
                            }
                        }
                    }
                    return false;
                },
                1
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => {
                    setCurrentListType(null);
                    return false;
                },
                1
            )
        );
    }, [editor, currentListType]);

    const value = {
        selectionMap,
        currAlignment,
        canUndo,
        canRedo,
        currentStyle,
        currentFontFamily,
        currentFontSize,
        currentLineHeight,
        currentListType,
        color,
        margins,
        setCurrentListType,
        setCurrentStyle,
        setCurrentFontFamily,
        setCurrentFontSize,
        setCurrentLineHeight,
        setCurrAlignment,
        setMargins,
        updateToolbar,
        changeColor
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditorContext = () => {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditorContext must be used within an EditorProvider');
    }
    return context;
};