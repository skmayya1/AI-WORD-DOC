import React from 'react'

interface ContainerProps {
    Checked?:boolean
    children:React.ReactNode
    border?:boolean
    handleClick?:()=> void
}

const Container:React.FC<ContainerProps> = ({
    children,
    Checked=false,
    border=false,
    handleClick
}) => {
  return (
    <div onClick={handleClick} className={`h-fit w-fit rounded-md  border-zinc-200 flex items-center justify-center ${border ? 'border':'border-0'} ${Checked ? 'bg-[#BFDBF7]':'bg-zinc-100'} p-2 `}>
        {children}
    </div>
  )
}

export default Container