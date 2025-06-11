import React from 'react'
import { IoMdSend } from "react-icons/io";
import { IoIosAdd } from "react-icons/io";
import { IoMdKey } from "react-icons/io";


const Input = () => {
    return (
        <div className='w-full h-[120px] rounded-lg bg-zinc-100 border-silver/30 border p-2 px-3 flex flex-col items-center justify-between gap-2 '>
            <div className="h-fit w-full flex items-center">
                <div className="bg-white text-[10px] flex items-center border border-silver/40 tracking-wide w-fit py-0.5 px-1 rounded-sm cursor-pointer text-eerie-black/70 hover:bg-white/70">
                    <span>
                        <IoIosAdd color='gray' size={12} />
                    </span> Template
                </div>
            </div>
            <div className="w-full h-full flex items-start justify-between gap-4">
                <textarea placeholder='Write, Generate , Edit anything' className='h-full w-full text-sm tracking-wide border-0 outline-0 resize-none' />
                <div className="h-full flex items-start justify-center ">
                    <IoMdSend color='#022B3A' size={20} />
                </div>
            </div>
        </div>
    )
}

export default Input