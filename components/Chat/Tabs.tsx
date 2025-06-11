import React from 'react'
import { IoCloseSharp } from "react-icons/io5";

const Tabs = () => {
  return (
    <div className='flex items-center justify-start w-full h-fit'>
        <span className='relative px-1.5 py-0.5 overflow-hidden w-fit text-[12px] text-eerie-black/80 border-silver/30 border rounded-md group select-none transition-all duration-300 ease-in-out hover:pr-5'>
            <span className='relative z-10 transition-all duration-300 ease-in-out group-hover:mr-1'>New Chat</span>
            <button className='absolute z-20 right-0 top-0 px-1 h-full opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0'>
                <IoCloseSharp size={15} color='gray'/>
            </button>
            <span className='absolute z-15 right-0 top-0 w-[50%] h-full bg-gradient-to-r from-transparent to-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out' />
        </span>
    </div>
  )
}

export default Tabs