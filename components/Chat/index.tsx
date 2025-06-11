import React from 'react'
import Input from './Input'
import Tabs from './Tabs'
import Header from './Header'

const Chat = () => {
  return (
    <div className='w-[20%] h-full rounded-lg bg-white py-2 px-2 flex flex-col items-center justify-between border border-[#022B3A]/30 '>
        <Header/>
        <Input/>
    </div>
  )
}

export default Chat