import React, { useCallback } from 'react'
import { useEditorContext } from '@/contexts/EditorContext';
import { handleClick } from '@/lib/utils';
import { GoQuestion } from "react-icons/go";
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import ConfigModal from './Chat/ConfigModal';
import { useModal } from '@/contexts/ModelContext';

import { TbSettings } from 'react-icons/tb'


const Menu = () => {
    const { editor, margins } = useEditorContext()
    const { showModal } = useModal()

    const handleExport = useCallback(() => {
        handleClick(editor, { margins }, "docx");
    }, [editor, margins]);



    return (
        <div className='w-full h-12 rounded-lg bg-white p-2 flex px-2 items-center justify-between'>
            <Tooltip>
                <TooltipTrigger>
                    <div onClick={() => showModal(<ConfigModal />)}>
                        <span className='relative py-0.5 overflow-hidden w-fit text-[13px] text-eerie-black/80 border-silver/30 border rounded-md group select-none transition-all duration-300 ease-in-out flex items-center gap-1 tracking-wide cursor-pointer px-2'>
                            Manage       <TbSettings size={14} />
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                    <p>Manage Api Keys</p>
                </TooltipContent>
            </Tooltip>

            {/* <GoQuestion color='gray' size={18} /> */}

            <div className='flex items-center gap-3'>
                <span className='text-xs text-zinc-400 font-medium'>
                    {/* {exportCredits} credit{exportCredits !== 1 ? 's' : ''} */}
                </span>
                <button
                    className='text-zinc-900 tracking-wide text-sm flex cursor-pointer bg-lblue rounded-lg px-3 py-1.5'
                    onClick={handleExport}
                >
                    Export as docx
                </button>
            </div>
        </div>
    )
}

export default Menu