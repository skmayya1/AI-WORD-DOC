import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    $isElementNode,
    LexicalEditor,
    COMMAND_PRIORITY_LOW,
    KEY_ENTER_COMMAND
} from 'lexical';
import { mergeRegister } from "@lexical/utils";
import { fontFamilyOptions, fontSizeOptions, lineHeightOptions, RichTextAction, stylesOptions } from '@/lib/constants';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';


interface EditorContextType {
    editor: LexicalEditor;
    // Selection state
    selectionMap: { [id: string]: boolean };
    currAlignment: ElementFormatType;
    canUndo: boolean;
    canRedo: boolean;
    color: string;

    // Current settings
    currentListType: 'ordered' | 'unordered' | null;
    currentStyle: string;
    currentFontFamily: string;
    currentFontSize: string;
    currentLineHeight: string;
    margins: { top: number; bottom: number; left: number; right: number };

    // Setters
    setCurrentStyle: (style: string) => void;
    setCurrentFontFamily: (family: string) => void;
    setCurrentListType: (type: 'ordered' | 'unordered' | null) => void;
    setCurrentFontSize: (size: string) => void;
    setCurrentLineHeight: (height: string) => void;
    setCurrAlignment: (alignment: ElementFormatType) => void;
    setMargins: (margins: { top: number; bottom: number; left: number; right: number } | ((prev: any) => any)) => void;

    updateToolbar: () => void;
    changeColor: (hex:string) => void;
    resetToDefaults: () => void;
    syncWithCurrentNode: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [editor] = useLexicalComposerContext();

    const defaultValues = {
        selectionMap: {},
        currAlignment: "left" as ElementFormatType,
        canUndo: false,
        canRedo: false,
        currentStyle: stylesOptions[0].value,
        currentFontFamily: fontFamilyOptions[3].value,
        currentFontSize: fontSizeOptions[2].value,
        currentLineHeight: lineHeightOptions[2].value,
        currentListType: null as 'ordered' | 'unordered' | null,
        color: '#111111',
        margins: {
            top: 1.0,
            bottom: 1.0,
            left: 1.0,
            right: 1.0
        }
    };

    const [selectionMap, setSelectionMap] = useState<{ [id: string]: boolean }>(defaultValues.selectionMap);
    const [currAlignment, setCurrAlignment] = useState<ElementFormatType>(defaultValues.currAlignment);
    const [canUndo, setCanUndo] = useState(defaultValues.canUndo);
    const [canRedo, setCanRedo] = useState(defaultValues.canRedo);
    const [currentStyle, setCurrentStyle] = useState(defaultValues.currentStyle);
    const [currentFontFamily, setCurrentFontFamily] = useState(defaultValues.currentFontFamily);
    const [currentFontSize, setCurrentFontSize] = useState(defaultValues.currentFontSize);
    const [currentLineHeight, setCurrentLineHeight] = useState(defaultValues.currentLineHeight);
    const [currentListType, setCurrentListType] = useState<'ordered' | 'unordered' | null>(defaultValues.currentListType);
    const [color, setcolor] = useState(defaultValues.color);
    const [margins, setMargins] = useState(defaultValues.margins);


    const changeColor = (hex:string) => {
        setcolor(hex);
      };
      

    const resetToDefaults = useCallback(() => {
        setSelectionMap(defaultValues.selectionMap);
        setCurrAlignment(defaultValues.currAlignment);
        setCanUndo(defaultValues.canUndo);
        setCanRedo(defaultValues.canRedo);
        setCurrentStyle(defaultValues.currentStyle);
        setCurrentFontFamily(defaultValues.currentFontFamily);
        setCurrentFontSize(defaultValues.currentFontSize);
        setCurrentLineHeight(defaultValues.currentLineHeight);
        setCurrentListType(defaultValues.currentListType);
        setcolor(defaultValues.color);
        setMargins(defaultValues.margins);
    }, []);

    // Sync states with the currently selected node
    const syncWithCurrentNode = useCallback(() => {
        editor.read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const anchorNode = selection.anchor.getNode();
                const element = anchorNode.getTopLevelElementOrThrow();

                const format = element.getFormatType();
                setCurrAlignment(format);

                const root = $getRoot();
                let foundListType: 'ordered' | 'unordered' | null = null;

                root.getChildren().forEach((node) => {
                    if ($isElementNode(node) && $isListNode(node)) {
                        foundListType = node.getListType() === 'number' ? 'ordered' : 'unordered';
                    }
                });

                setCurrentListType(foundListType);

                // Sync text formatting
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
        });
    }, [editor]);

    const updateToolbar = useCallback(() => {
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
    }, []);

    useEffect(() => {
        return mergeRegister(
            // Main update listener - handles most state updates
            editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, prevEditorState }) => {
                editorState.read(() => {
                    updateToolbar();

                    // Check for new nodes or significant structure changes
                    const hasStructuralChanges = dirtyElements.size > 0;

                    if (hasStructuralChanges) {
                        // Sync with current node when structure changes
                        syncWithCurrentNode();
                    }

                    // Handle list state
                    const root = $getRoot();
                    let hasList = false;
                    let listType: 'ordered' | 'unordered' | null = null;

                    root.getChildren().forEach((node) => {
                        if ($isElementNode(node) && $isListNode(node)) {
                            hasList = true;
                            listType = node.getListType() === 'number' ? 'ordered' : 'unordered';
                        }
                    });

                    if (!hasList && currentListType !== null) {
                        setCurrentListType(null);
                    } else if (hasList && currentListType !== listType) {
                        setCurrentListType(listType);
                    }
                });
            }),
            editor.registerCommand(
                KEY_ENTER_COMMAND,
                () => {
                  editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) && selection.isCollapsed()) {
                        setCurrentStyle(defaultValues.currentStyle)
                      setCurrentFontSize(defaultValues.currentFontSize);
                      setCurrentLineHeight(defaultValues.currentLineHeight);
                    }
                  });
              
                  return false;
                },
                COMMAND_PRIORITY_LOW
              ),
              

            // Selection change listener
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (payload) => {
                    updateToolbar();
                    // Sync with new selection
                    syncWithCurrentNode();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),

            // Undo/Redo state
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),

            // List command handlers - reset state when lists are modified
            editor.registerCommand(
                INSERT_ORDERED_LIST_COMMAND,
                () => {
                    setCurrentListType('ordered');
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                INSERT_UNORDERED_LIST_COMMAND,
                () => {
                    setCurrentListType('unordered');
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                REMOVE_LIST_COMMAND,
                () => {
                    setCurrentListType(null);
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),

            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                () => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const node = selection.anchor.getNode();
                        if ($isListNode(node) && selection.anchor.offset === 0) {
                            setTimeout(() => {
                                editor.read(() => {
                                    const root = $getRoot();
                                    let hasList = false;
                                    root.getChildren().forEach((child) => {
                                        if ($isElementNode(child) && $isListNode(child)) {
                                            hasList = true;
                                        }
                                    });
                                    if (!hasList) {
                                        setCurrentListType(null);
                                    }
                                });
                            }, 0);
                        }
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),

            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => {
                    syncWithCurrentNode();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
        );
    }, [editor, currentListType, updateToolbar, syncWithCurrentNode]);

    const setCurrentListTypeEnhanced = useCallback((type: 'ordered' | 'unordered' | null) => {
        setCurrentListType(type);

        if (type === null) {
            setTimeout(() => syncWithCurrentNode(), 0);
        }
    }, [syncWithCurrentNode]);

    const value = {
        editor,
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
        setCurrentListType: setCurrentListTypeEnhanced,
        setCurrentStyle,
        setCurrentFontFamily,
        setCurrentFontSize,
        setCurrentLineHeight,
        setCurrAlignment,
        setMargins,
        updateToolbar,
        changeColor,
        resetToDefaults,
        syncWithCurrentNode
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