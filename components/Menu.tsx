import React, { useCallback } from 'react'
import { useEditorContext } from '@/contexts/EditorContext';
import { handleClick } from '@/lib/utils';

const Menu = () => {
    const { editor, margins } = useEditorContext()

    const handleExport = useCallback(() => {
        handleClick(editor, { margins }, "docx");
    }, [editor, margins]);

    return (
        <div className='w-full h-18 rounded-lg bg-white p-2 flex flex-col items-center justify-between'>
            <div className="flex items-center h-full justify-center gap-2 px-4">
                <button
                    className='px-4 py-1.5 bg-lblue text-black rounded-lg font-thin text-sm cursor-pointer'
                    onClick={handleExport}
                >
                    Export
                </button>
            </div>
        </div>
    )
}

export default Menu