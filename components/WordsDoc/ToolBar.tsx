import React, { SetStateAction, useEffect, useRef, useState } from 'react';
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
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import {
    $createHeadingNode,
    $createQuoteNode,
} from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { useEditorContext } from '@/contexts/EditorContext';
import { formatParagraph, handleClick } from '@/lib/utils';
import { TwitterPicker } from 'react-color';
import { RxMargin } from "react-icons/rx";
import { useModal } from '@/contexts/ModelContext';
import MarginModal from './Margin';


const ToolBar = ({
    setMargins
}:{
    setMargins: (margins: { top: number; bottom: number; left: number; right: number } | ((prev: any) => any)) => void;
}) => {
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

    const [isModalOpen, setisModalOpen] = useState(false)
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const {showModal} = useModal()

    console.log(color);

    setMargins(margins)


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setisModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);



    const handleUpdate = (value: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, value);
    };

    const handleAlignmentUpdate = (value: ElementFormatType) => {
        setCurrAlignment(value);
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value);
    };

    const handleStyleChange = (style: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                switch (style) {
                    case 'normal':
                        $setBlocksType(selection, () => $createParagraphNode());
                        break;
                    case 'title':
                        $setBlocksType(selection, () => $createHeadingNode('h1'));
                        break;
                    case 'subtitle':
                        $setBlocksType(selection, () => $createHeadingNode('h2'));
                        break;
                    case 'heading1':
                        $setBlocksType(selection, () => $createHeadingNode('h1'));
                        break;
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
    };

    const handleFontFamilyChange = (fontFamily: string) => {
        setCurrentFontFamily(fontFamily);
        editor.update(() => {
            if (editor.isEditable()) {
                const selection = $getSelection();
                if (selection !== null) {
                    $patchStyleText(selection, {
                        'font-family': fontFamily,
                    });
                }
            }
        })
    };

    const handleFontSizeChange = (fontSize: string) => {
        setCurrentFontSize(fontSize);
        editor.update(() => {
            if (editor.isEditable()) {
                const selection = $getSelection();
                if (selection !== null) {
                    $patchStyleText(selection, {
                        'font-size': fontSize,
                    });
                }
            }
        })
    };

    const handleLineHeightChange = (lineHeight: string) => {
        setCurrentLineHeight(lineHeight)
        editor.update(() => {
            if (editor.isEditable()) {
                const selection = $getSelection();
                if (selection !== null) {
                    $patchStyleText(selection, {
                        'line-height': lineHeight,
                    });
                }
            }
        })
    };

    const handleUndoRedo = (action: string) => {
        if (action === 'undo') {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
        } else if (action === 'redo') {
            editor.dispatchCommand(REDO_COMMAND, undefined);
        }
    };

    const handleListCommand = (command: string) => {
        if (command === 'INSERT_UNORDERED_LIST_COMMAND') {
            if (currentListType === 'unordered') {
                setCurrentListType(null);
                formatParagraph(editor)
            } else {
                setCurrentListType('unordered');
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            }
        } else if (command === 'INSERT_ORDERED_LIST_COMMAND') {
            if (currentListType === 'ordered') {
                setCurrentListType(null);
                formatParagraph(editor)
            } else {
                setCurrentListType('ordered');
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            }
        }
    };



    const FILE_NAME = "untitled"

    return (
        <div className='min-h-16 w-full p-2 relative'>
            {isModalOpen && (
                <div className="absolute top-18 right-117" ref={colorPickerRef}>
                    <TwitterPicker

                        color={color}
                        onChangeComplete={changeColor}
                    />
                </div>
            )}
            <div className="min-h-full w-full bg-zinc-100 rounded-md border border-zinc-200 px-5 py-2 \flex items-center justify-start flex scrollbar-x-thin">

                <div className="text-sm font-thin border-r px-2  border-zinc-200 h-full flex items-center justify-center gap-3 w-180px]">
                    <span className=' w-full flex-nowrap overflow-hidden line-clamp-1'>{FILE_NAME}</span>
                </div>

                {/* Undo/Redo Section */}
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

                    {/* Text Formatting Buttons */}
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

                        {/* Text Color Control */}
                        <div
                            onClick={() => setisModalOpen(true)}
                            className="flex flex-col items-center justify-center cursor-pointer leading-14 relative"
                        >
                            <p className='font-semibold text-sm'>A</p>
                            <span style={{ backgroundColor: color }} className='h-1 w-4 rounded-md' />
                        </div>
                    </div>
                </div>

                {/* Text Alignment Controls */}
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

                {/* Lists and Line Height Controls */}
                <div className="flex items-center h-full justify-center gap-2 px-2 border-r border-zinc-200">
                    {/* List Controls */}
                    <div className="flex items-center gap-1.5">
                        {listOptions.map((listOption) => {
                            const IconComponent = listOption.icon;
                            return (
                                <Container
                                    Checked={currentListType == listOption.type}
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

                <div className="flex items-center h-full justify-center gap-2 px-2">
                    <button onClick={()=>showModal(<MarginModal />)} className='flex items-center justify-center gap-1 cursor-pointer flex-col'>
                        <RxMargin size={22} />
                    </button>
                    {/* <button onClick={NewPage} className='flex items-center justify-center gap-1 cursor-pointer flex-col'>
                        <ImPageBreak size={22} />
                    </button> */}
                </div>


                <div className="flex items-center h-full justify-center gap-2 px-2">
                    <button className='px-4 py-1.5  bg-lblue text-black rounded-lg font-thin text-sm cursor-pointer' onClick={() => {
                        handleClick(editor,{margins})
                    }}>Export</button>
                </div>
            </div> 
        </div>
    );
};

export default ToolBar;










