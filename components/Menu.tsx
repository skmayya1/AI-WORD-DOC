import React, { useCallback, useEffect, useState } from 'react'
import { useEditorContext } from '@/contexts/EditorContext';
import { handleClick } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import ConfigModal from './Chat/ConfigModal';
import { useModal } from '@/contexts/ModelContext';

import { TbSettings } from 'react-icons/tb'
import { API_URL } from '@/lib/constants';




const Menu = () => {
    const { editor, margins } = useEditorContext()
    const { showModal } = useModal()
    const [serverStatus, setServerStatus] = useState<'loading' | 'online' | 'offline'>('loading')


    const handleExport = useCallback(() => {
        handleClick(editor, { margins }, "docx");
    }, [editor, margins]);

    useEffect(() => {
        const checkServer = async () => {
            try {
                const res = await fetch(API_URL + '/api/health', { method: 'GET' })
                if (res.ok) setServerStatus('online')
                else setServerStatus('offline')
            } catch {
                setServerStatus('offline')
            }
        }
        checkServer()
    }, [])

    const color =
        serverStatus === 'online' ? 'bg-green-500' :
            serverStatus === 'offline' ? 'bg-red-500' :
                'bg-gray-400'

    const text =
        serverStatus === 'online' ? 'Server is Online' :
            serverStatus === 'offline' ? 'Server is Offline (sleeping?)' :
                'Checking server...'

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

            <div className='flex items-center gap-3'>
                <Tooltip>
                    <TooltipTrigger>
                        <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
                    </TooltipTrigger>
                    <TooltipContent side='left'>
                        <p className="text-xs pr-2  ">{text}</p>
                    </TooltipContent>
                </Tooltip>
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