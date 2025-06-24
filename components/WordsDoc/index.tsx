import React from 'react'
import LexicalEditor from './Editor';
import ToolBar from './ToolBar';

const WordsViewer = () => {

    return (
        <div className="bg-[#fafafa] h-full w-[78.5%] rounded-lg border  relative overflow-hidden" >
            <ToolBar />
            <div className="overflow-auto scrollbar-thin h-full max-h-[93%] w-full py-4 bg-white">
                <LexicalEditor />
            </div>
        </div>
    )
}

export default WordsViewer