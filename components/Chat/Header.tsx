import React from 'react'
import Tabs from './Tabs'
import { IoIosAdd } from "react-icons/io";
import { TbSettings } from "react-icons/tb";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useModal } from '@/contexts/ModelContext';
import ConfigModal from './ConfigModal';
import { useChat } from '@/contexts/ChatContext';

const Header = () => {
    const { showModal } = useModal()
    const { createNewChat } = useChat()
    
    return (
        <div className='h-fit w-full flex items-center justify-between '>
            <Tabs />
            <div className="flex gap-2 items-center">
                <Tooltip >
                    <TooltipTrigger>
                        <span onClick={createNewChat} className='font-semibold cursor-pointer'>
                            <IoIosAdd size={20} color='#022B3A' />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>
                        <p className='z-[60]'>New Chat / Tab</p>
                    </TooltipContent>
                </Tooltip>
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
            </div>
        </div>
    )
}

export default Header