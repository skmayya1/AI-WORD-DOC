import { useChat } from '@/contexts/ChatContext';
import React, { useState, useRef, useEffect } from 'react'
import { IoCloseSharp, IoChevronForward, IoChevronBack } from "react-icons/io5";

const Tabs: React.FC = () => {
  const { chats, deleteChat , switchChat } = useChat()
  const [showOverflow, setShowOverflow] = useState<boolean>(false)
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false)
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  const checkOverflow = (): void => {
    if (containerRef.current && tabsRef.current) {
      const container = containerRef.current
      const tabs = tabsRef.current
      const hasOverflow = tabs.scrollWidth > container.clientWidth
      setShowOverflow(hasOverflow)
      
      if (hasOverflow) {
        setCanScrollLeft(tabs.scrollLeft > 0)
        setCanScrollRight(tabs.scrollLeft < tabs.scrollWidth - tabs.clientWidth)
      }
    }
  }

  useEffect(() => {
    checkOverflow()
    const handleResize = () => checkOverflow()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [chats])

  const scroll = (direction: 'left' | 'right'): void => {
    if (tabsRef.current) {
      const scrollAmount = 150
      const newScrollLeft = tabsRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      tabsRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
      
      // Update scroll buttons after animation
      setTimeout(() => checkOverflow(), 300)
    }
  }

  return (
    <div ref={containerRef} className='flex items-center justify-start w-[85%] h-fit relative rounded-md overflow-hidden'>
      {/* Left scroll button */}
      {showOverflow && canScrollLeft && (
        <button 
          onClick={() => scroll('left')}
          className='absolute left-0 z-30 bg-white/90 backdrop-blur-sm border border-silver/30 rounded-md p-1 shadow-sm hover:bg-white transition-colors duration-200'
        >
          <IoChevronBack size={12} color='gray' />
        </button>
      )}
      
      {/* Tabs container */}
      <div 
        ref={tabsRef}
        className={`flex items-center justify-start w-full h-fit overflow-x-auto scrollbar-none ${showOverflow ? 'px-6' : ''}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={checkOverflow}
      >
        {chats.map((chat, idx) => (
          <span 
            key={chat.id + idx}
            className='relative px-1.5 py-0.5 overflow-hidden w-fit min-w-fit text-[12px] text-eerie-black/80 border-silver/30 border rounded-md group select-none transition-all duration-300 ease-in-out  mr-1 flex-shrink-0'
          >
            <span onClick={()=> switchChat(chat.id)} className='relative z-10 transition-all duration-300 ease-in-out  whitespace-nowrap px-1.5'>
              {chat.tabName}
            </span>
            <button 
              onClick={() => deleteChat(chat.id)} 
              className='absolute z-20 right-0 top-0 px-1  h-full opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out '
            >
              <IoCloseSharp size={15} color='gray' />
            </button>
            <span className='absolute z-15 right-0 top-0 w-[50%] h-full bg-gradient-to-r from-transparent to-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out' />
          </span>
        ))}
      </div>
      
      {/* Right scroll button */}
      {showOverflow && canScrollRight && (
        <button 
          onClick={() => scroll('right')}
          className='absolute right-0 z-30 bg-white/90 backdrop-blur-sm border border-silver/30 rounded-md p-1 shadow-sm hover:bg-white transition-colors duration-200'
        >
          <IoChevronForward size={12} color='gray' />
        </button>
      )}
    </div>
  )
}

export default Tabs