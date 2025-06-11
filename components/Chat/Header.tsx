import React from 'react'
import Tabs from './Tabs'
import { IoIosAdd } from "react-icons/io";
import { TbSettings } from "react-icons/tb";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const Header = () => {
    return (
        <div className='h-fit w-full flex items-center justify-between gap-2'>
            <Tabs />
            <div className="flex gap-2 items-center">
                <Tooltip>
                    <TooltipTrigger>
                        <span className='font-semibold cursor-pointer'>
                            <IoIosAdd size={20} color='#022B3A' />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className=''>
                        <p>New Chat / Tab</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>


                        <span className='relative py-0.5 overflow-hidden w-fit text-[13px] text-eerie-black/80 border-silver/30 border rounded-md group select-none transition-all duration-300 ease-in-out flex items-center gap-1 tracking-wide cursor-pointer px-2'>
                            Manage       <TbSettings size={14} />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className=''>
                        <p>Manage Api Keys</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    )
}

export default Header