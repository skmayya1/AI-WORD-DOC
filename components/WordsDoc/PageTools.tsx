import React from 'react'
import Container from './Container'
import { Plus, Trash2 } from 'lucide-react'

const PageTools = () => {
    return (
        <Container border>
            <div className='flex items-center gap-4 px-1'>
                {/* Delete Page */}
                <button className="flex items-center gap-1 px-1 py-1 text-sm hover:bg-gray-100 rounded">
                    <Trash2 size={16} className="text-gray-600" />
                </button>
                {/* Page Count */}
                <span className="text-sm text-gray-600 ">
                    Page 1 of 1
                </span>
                {/* New Page */}
                <button className="flex items-center gap-1 px-3 py-1 text-sm bg-lblue hover:bg-lblue/70  rounded-lg">
                    <Plus size={16} className="text-gray-600" />
                    <span className="text-gray-700">New Page</span>
                </button>
            </div>
        </Container>
    )
}

export default PageTools