import React, { useCallback } from 'react'
import { useEditorContext } from '@/contexts/EditorContext';
import { handleClick } from '@/lib/utils';
import { GoQuestion } from "react-icons/go";


const Menu = () => {
    const { editor, margins } = useEditorContext()

    const handleExport = useCallback(() => {
        handleClick(editor, { margins }, "docx");
    }, [editor, margins]);

    // You can adjust this value based on your credit system
    // const exportCredits = 1;

    return (
        <div className='w-full h-12 rounded-lg bg-white p-2 flex px-5 items-center justify-between'>
            
            <GoQuestion color='gray' size={18} />
            
            <div className='flex items-center gap-3'>
                <span className='text-xs text-zinc-400 font-medium'>
                    {/* {exportCredits} credit{exportCredits !== 1 ? 's' : ''} */}
                </span>
                <button
                    className='text-zinc-900 tracking-wide text-sm flex cursor-pointer bg-lblue rounded-lg px-5 py-1.5'
                    onClick={handleExport}
                >
                    Export as docx
                </button>
            </div>
        </div>
    )
}

export default Menu