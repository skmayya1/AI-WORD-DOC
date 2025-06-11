import React, { useEffect, useState } from 'react'
import Container from './Container'
import { BiUndo, BiRedo } from "react-icons/bi";
import SelectInput from '../DropDown';
import { fontFamilyOptions, fontSizeOptions, lineHeightOptions, stylesOptions } from '@/lib/constants';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaHighlighter } from "react-icons/fa6";
import { CiTextAlignCenter, CiTextAlignJustify, CiTextAlignLeft, CiTextAlignRight } from "react-icons/ci";
import { PiListBullets } from "react-icons/pi";
import { MdFormatListNumbered } from "react-icons/md";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, ElementFormatType, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND, TextFormatType ,} from 'lexical';
import { mergeRegister } from "@lexical/utils";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';

export enum RichTextAction {
    Bold = "bold",
    Italics = "italic",
    Underline = "underline",
    Strikethrough = "strikethrough",
    // Superscript = "superscript",
    // Subscript = "subscript",
    Highlight = "highlight",
    Code = "code",
    Undo = "undo",
    Redo = "redo",
  }


const Header = () => {
    const [editor] = useLexicalComposerContext()
    const [selectionMap, setSelectionMap] = useState<{ [id: string]: boolean }>(
        {}
    );
    const [currAlignment, setcurrAlignment] = useState<ElementFormatType>("left")

    const handleUpdate = (value:TextFormatType)=>{
        editor.dispatchCommand(FORMAT_TEXT_COMMAND,value)
    }
    const handleAlignmentUpdate = (value: ElementFormatType) => {
        setcurrAlignment(value)
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND,value )
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
            });
          }),
          editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            (payload) => {
              updateToolbar();
              return false;
            },
            1
          )
        );
      }, [editor]);
    return (
        <div className='min-h-16 w-full p-2 flex items-center justify-center'>
            <div className="min-h-full w-full bg-zinc-100 rounded-md border border-zinc-200 px-20 py-2 flex items-center flex-wrap">
                {/* undo redo thing */}
                <div className="flex h-full w-fit items-center justify-center gap-4 border-r border-zinc-200 px-5">
                    <button className='font-light cursor-pointer'>
                        <BiUndo color='#8b8c89' size={22} />
                    </button>
                    <button className='font-light cursor-pointer'>
                        <BiRedo color='#8b8c89' size={22} />
                    </button>
                </div>
                
                {/* Font and text formatting controls */}
                <div className="flex items-center h-full justify-center gap-3 px-5 border-r border-zinc-200 ">
                    <div className="flex items-center gap-2.5 px-2">
                        <SelectInput
                            onChange={() => { }}
                            className='min-w-[160px]'
                            options={stylesOptions}
                            value={stylesOptions[0].value}
                        />
                        <SelectInput
                            className='min-w-[130px]'
                            onChange={() => { }}
                            options={fontFamilyOptions}
                            value={fontFamilyOptions[0].value}
                        />
                        <SelectInput
                            className='min-w-[60px]'
                            onChange={() => { }}
                            options={fontSizeOptions}
                            value={fontSizeOptions[0].value}
                        />
                    </div>
                    <div className="flex items-center gap-1.5 px-4">
                        <Container Checked={selectionMap[RichTextAction.Bold]} handleClick={() => handleUpdate("bold")}>
                            <button>
                                <FaBold color='#022B3A' size={12} />
                            </button>
                        </Container>
                        <Container Checked={selectionMap[RichTextAction.Italics]} handleClick={() => handleUpdate("italic")}>
                            <button>
                                <FaItalic color='#022B3A' size={12} />
                            </button>
                        </Container>
                        <Container Checked={selectionMap[RichTextAction.Underline]} handleClick={() => handleUpdate("underline")}>
                            <button>
                                <FaUnderline color='#022B3A' size={12} />
                            </button>
                        </Container>
                        <Container Checked={selectionMap[RichTextAction.Strikethrough]} handleClick={() => handleUpdate("strikethrough")}>
                            <button>
                                <FaStrikethrough color='#022B3A' size={12} />
                            </button>
                        </Container>
                        <Container Checked={selectionMap[RichTextAction.Highlight]} handleClick={() => handleUpdate("highlight")}>
                            <button>
                                <FaHighlighter color='#022B3A' size={12} />
                            </button>
                        </Container>
                        <div className="flex flex-col items-center justify-center cursor-pointer leading-14">
                            <p className='font-semibold text-sm'>A</p>
                            <span className='bg-[#c1121f] h-1 w-4 rounded-md' />
                        </div>
                    </div>
                </div>
                
                {/* Text alignment controls */}
                <div className="flex items-center h-full justify-center gap-3 px-5 border-r border-zinc-200 ">
                    <Container handleClick={() => handleAlignmentUpdate('left')} Checked={currAlignment === 'left'}>
                        <button>
                            <CiTextAlignLeft color='#022B3A' size={16} />
                        </button>
                    </Container>
                    <Container handleClick={() => handleAlignmentUpdate('center')} Checked={currAlignment === 'center'}>
                        <button>
                            <CiTextAlignCenter color='#022B3A' size={16} />
                        </button>
                    </Container>
                    <Container handleClick={() => handleAlignmentUpdate('right')} Checked={currAlignment === 'right'}>
                        <button>
                            <CiTextAlignRight color='#022B3A' size={16} />
                        </button>
                    </Container>
                    <Container handleClick={() => handleAlignmentUpdate('justify')} Checked={currAlignment === 'justify'}>
                        <button>
                            <CiTextAlignJustify color='#022B3A' size={16} />
                        </button>
                    </Container>
                </div>

                {/* Lists and Line Height controls */}
                <div className="flex items-center h-full justify-center gap-3 px-5 border-r border-zinc-200">
                    {/* List controls */}
                    <div className="flex items-center gap-1.5">
                        <Container handleClick={()=>{
                             editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)

                        }}>
                            <button>
                                <PiListBullets color='#022B3A' size={16} />
                            </button>
                        </Container>
                        <Container>
                            <button>
                                <MdFormatListNumbered color='#022B3A' size={16} />
                            </button>
                        </Container>
                    </div>
                    
                    {/* Line height selector */}
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-sm text-zinc-600 whitespace-nowrap">Line Height:</span>
                        <SelectInput
                            className='min-w-[80px]'
                            onChange={() => { }}
                            options={lineHeightOptions}
                            value={lineHeightOptions[2].value} // Default to 1.5 (recommended for reports)
                        />
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default Header