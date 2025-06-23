import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Container from './Container';
import SelectInput from '../DropDown';
import {
    fontFamilyOptions,
    fontSizeOptions,
    lineHeightOptions,
    stylesOptions,
    textFormatActions,
    alignmentOptions,
    listOptions,
    undoRedoActions,
    RichTextAction
} from '@/lib/constants';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getSelection,
    $isRangeSelection,
    $createParagraphNode,
    ElementFormatType,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    TextFormatType,
    UNDO_COMMAND,
    REDO_COMMAND,
} from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import {
    $createHeadingNode,
    $createQuoteNode,
} from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { useEditorContext } from '@/contexts/EditorContext';
import { handleClick } from '@/lib/utils';
import { ColorResult, TwitterPicker } from 'react-color';
import { RxMargin } from "react-icons/rx";
import { useModal } from '@/contexts/ModelContext';
import MarginModal from './Margin';

const FILE_NAME = "untitled";

const ToolBar = () => {
    const [editor] = useLexicalComposerContext();
    const {
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
        setCurrentStyle,
        setCurrentFontFamily,
        setCurrentFontSize,
        setCurrentLineHeight,
        setCurrAlignment,
        setCurrentListType,
        changeColor
    } = useEditorContext();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const { showModal } = useModal();

    // Optimized click outside handler
    useEffect(() => {
        if (!isModalOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isModalOpen]);

    // Memoized handlers to prevent unnecessary re-renders
    const handleUpdate = useCallback((value: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, value);
    }, [editor]);

    const handleAlignmentUpdate = useCallback((value: ElementFormatType) => {
        setCurrAlignment(value);
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value);
    }, [editor, setCurrAlignment]);

    const handleStyleChange = useCallback((style: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                switch (style) {
                    case 'normal':
                        $setBlocksType(selection, () => $createParagraphNode());
                        break;
                    case 'title':
                    case 'heading1':
                        $setBlocksType(selection, () => $createHeadingNode('h1'));
                        break;
                    case 'subtitle':
                    case 'heading2':
                        $setBlocksType(selection, () => $createHeadingNode('h2'));
                        break;
                    case 'heading3':
                        $setBlocksType(selection, () => $createHeadingNode('h3'));
                        break;
                    case 'quote':
                        $setBlocksType(selection, () => $createQuoteNode());
                        break;
                    case 'code':
                        $setBlocksType(selection, () => $createCodeNode());
                        break;
                }
            }
        });
        setCurrentStyle(style);
    }, [editor, setCurrentStyle]);

    const applyStyleToSelection = useCallback((styleProperty: string, value: string) => {
        editor.update(() => {
            if (editor.isEditable()) {
                const selection = $getSelection();
                if (selection !== null) {
                    $patchStyleText(selection, { [styleProperty]: value });
                }
            }
        });
    }, [editor]);

    const handleFontFamilyChange = useCallback((fontFamily: string) => {
        setCurrentFontFamily(fontFamily);
        applyStyleToSelection('font-family', fontFamily);
    }, [setCurrentFontFamily, applyStyleToSelection]);

    const handleFontSizeChange = useCallback((fontSize: string) => {
        setCurrentFontSize(fontSize);
        applyStyleToSelection('font-size', fontSize);

    }, [setCurrentFontSize, applyStyleToSelection]);

    const handleLineHeightChange = useCallback((lineHeight: string) => {
        setCurrentLineHeight(lineHeight);
        applyStyleToSelection('line-height', lineHeight);
    }, [setCurrentLineHeight, applyStyleToSelection]);

    const handleUndoRedo = useCallback((action: string) => {
        const command = action === 'undo' ? UNDO_COMMAND : REDO_COMMAND;
        editor.dispatchCommand(command, undefined);
    }, [editor]);

    const handleListCommand = useCallback((command: string) => {
        const isUnorderedCommand = command === 'INSERT_UNORDERED_LIST_COMMAND';
        const targetListType = isUnorderedCommand ? 'unordered' : 'ordered';
        const lexicalCommand = isUnorderedCommand ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND;

        if (currentListType === targetListType) {
            setCurrentListType(null);
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        } else {
            setCurrentListType(targetListType);
            editor.dispatchCommand(lexicalCommand, undefined);
        }
    }, [editor, currentListType, setCurrentListType]);

    const handleColorToggle = useCallback(() => {
        setIsModalOpen(prev => !prev);
    }, []);


    const handleMarginModal = useCallback(() => {
        showModal(<MarginModal />);
    }, [showModal]);

    const undoRedoSection = useMemo(() => (
        <div className="flex h-full w-fit items-center justify-center gap-4 border-r border-zinc-200 px-3">
            {undoRedoActions.map((item) => {
                const IconComponent = item.icon;
                const isDisabled = item.action === 'undo' ? !canUndo : !canRedo;
                return (
                    <button
                        key={item.action}
                        className={`font-light cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
                        onClick={() => handleUndoRedo(item.action)}
                        disabled={isDisabled}
                        title={item.label}
                    >
                        <IconComponent color='#8b8c89' size={22} />
                    </button>
                );
            })}
        </div>
    ), [canUndo, canRedo, handleUndoRedo]);

    const formatButtonsSection = useMemo(() => (
        <div className="flex items-center gap-1.5 px-2">
            {textFormatActions.map((formatAction) => {
                const IconComponent = formatAction.icon;
                const actionKey = RichTextAction[formatAction.key as keyof typeof RichTextAction];

                return (
                    <Container
                        key={formatAction.action}
                        Checked={selectionMap[actionKey]}
                        handleClick={() => handleUpdate(formatAction.action as TextFormatType)}
                    >
                        <button title={formatAction.label}>
                            <IconComponent color='#022B3A' size={12} />
                        </button>
                    </Container>
                );
            })}

            <div
                onClick={handleColorToggle}
                className="flex flex-col items-center justify-center cursor-pointer leading-14 relative"
            >
                <p className='font-semibold text-sm'>A</p>
                <span style={{ backgroundColor: color }} className='h-1 w-4 rounded-md' />
            </div>
        </div>
    ), [selectionMap, handleUpdate, color, handleColorToggle]);

    const alignmentSection = useMemo(() => (
        <div className="flex items-center h-full justify-center gap-2 px-5 border-r border-zinc-200">
            {alignmentOptions.map((alignOption) => {
                const IconComponent = alignOption.icon;
                return (
                    <Container
                        key={alignOption.alignment}
                        handleClick={() => handleAlignmentUpdate(alignOption.alignment as ElementFormatType)}
                        Checked={currAlignment === alignOption.alignment}
                    >
                        <button title={alignOption.label}>
                            <IconComponent color='#022B3A' size={16} />
                        </button>
                    </Container>
                );
            })}
        </div>
    ), [currAlignment, handleAlignmentUpdate]);

    const listSection = useMemo(() => (
        <div className="flex items-center gap-1.5">
            {listOptions.map((listOption) => {
                const IconComponent = listOption.icon;
                return (
                    <Container
                        Checked={currentListType === listOption.type}
                        key={listOption.type}
                        handleClick={() => handleListCommand(listOption.command)}
                    >
                        <button title={listOption.label}>
                            <IconComponent color='#022B3A' size={16} />
                        </button>
                    </Container>
                );
            })}
        </div>
    ), [currentListType, handleListCommand]);

    return (
        <div className='min-h-16 w-full p-2 relative'>
            {isModalOpen && (
                <div className="absolute top-18 right-117 z-10" ref={colorPickerRef}>
                    <TwitterPicker
                        colors={[
                            '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
                            '#FF5733', '#C70039', '#900C3F', '#2E86C1', '#28B463', '#F1C40F'
                        ]}
                        color={color}
                        onChangeComplete={(ColorResult: ColorResult) => {
                            changeColor(ColorResult.hex)
                            editor.focus();
                            editor.update(() => {
                                const selection = $getSelection();

                                if (!selection || !$isRangeSelection(selection)) {
                                    console.warn("No valid selection after focus");
                                    return;
                                }
                                if (selection.isCollapsed()) {
                                    selection.setStyle(`color:${ColorResult.hex}`);
                                } else {
                                    $patchStyleText(selection, { color: ColorResult.hex });
                                }

                            })
                            setIsModalOpen(false)
                        }} />
                </div>
            )}

            <div className="min-h-full w-full bg-zinc-100 rounded-md border border-zinc-200 px-5 py-2 flex items-center justify-start flex scrollbar-x-thin">

                {/* File Name */}
                <div className="text-sm font-thin border-r px-2 border-zinc-200 h-full flex items-center justify-center gap-3 w-180px]">
                    <span className='w-full flex-nowrap overflow-hidden line-clamp-1'>{FILE_NAME}</span>
                </div>

                {undoRedoSection}

                {/* Style and Font Controls */}
                <div className="flex items-center h-full justify-center gap-2 px-3 border-r border-zinc-200">
                    <div className="flex items-center gap-2.5 px-2">
                        <SelectInput
                            onChange={handleStyleChange}
                            className='min-w-[160px]'
                            options={stylesOptions}
                            value={currentStyle}
                        />
                        <SelectInput
                            className='min-w-[130px]'
                            onChange={handleFontFamilyChange}
                            options={fontFamilyOptions}
                            value={currentFontFamily}
                        />
                        <SelectInput
                            className='min-w-[60px]'
                            onChange={handleFontSizeChange}
                            options={fontSizeOptions}
                            value={currentFontSize}
                        />
                    </div>

                    {formatButtonsSection}
                </div>

                {alignmentSection}

                {/* Lists and Line Height */}
                <div className="flex items-center h-full justify-center gap-2 px-2 border-r border-zinc-200">
                    {listSection}
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-sm text-zinc-600 whitespace-nowrap">Line Height:</span>
                        <SelectInput
                            className='min-w-[80px]'
                            onChange={handleLineHeightChange}
                            options={lineHeightOptions}
                            value={currentLineHeight}
                        />
                    </div>
                </div>

                {/* Margin Button */}
                <div className="flex items-center h-full justify-center gap-2 px-4 ">
                    <button onClick={handleMarginModal} className='flex items-center justify-center gap-1 cursor-pointer flex-col'>
                        <RxMargin size={22} />
                    </button>
                </div>


            </div>
        </div>
    );
};

export default ToolBar;