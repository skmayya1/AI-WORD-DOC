import React from 'react'
import Tabs from './Tabs'
import { IoIosAdd } from "react-icons/io";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useChat } from '@/contexts/ChatContext';

const Header = () => {
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

            </div>
        </div>
    )
}

export default Header