import React, { useState } from 'react'
import { FileText, Maximize2, Minimize2 } from 'lucide-react'
import { useEditorContext } from '@/contexts/EditorContext'

interface Template {
    id: string;
    name: string;
    icon: React.ReactNode;
    values: { top: string; bottom: string; left: string; right: string };
}

const MarginModal: React.FC = () => {

    const {margins,setMargins} = useEditorContext()

    const [selectedTemplate, setSelectedTemplate] = useState('normal')

    const templates: Template[] = [
        {
            id: 'normal',
            name: 'Normal',
            icon: <FileText className="w-4 h-4" />,
            values: { top: '1.0', bottom: '1.0', left: '1.0', right: '1.0' }
        },
        {
            id: 'narrow',
            name: 'Narrow',
            icon: <Minimize2 className="w-4 h-4" />,
            values: { top: '0.5', bottom: '0.5', left: '0.5', right: '0.5' }
        },
        {
            id: 'wide',
            name: 'Wide',
            icon: <Maximize2 className="w-4 h-4" />,
            values: { top: '1.0', bottom: '1.0', left: '2.0', right: '2.0' }
        }
    ]

    const handleMarginChange = (field: string, value: string) => {
        setMargins(prev => ({
            ...prev,
            [field]: value
        }))
        setSelectedTemplate('custom')
    }

    const handleTemplateSelect = (template: Template) => {
        setSelectedTemplate(template.id)
        setMargins({
            top: parseFloat(template.values.top),
            bottom: parseFloat(template.values.bottom),
            left: parseFloat(template.values.left),
            right: parseFloat(template.values.right)
        })
        
    }

    return (
        <div className='h-fit w-[30%] rounded-lg border border-zinc-200 bg-[#F4F4F5] z-100 p-5 pb-8'>
            <p className="mb-4">Margins ( inches ) :</p>

            <div className="grid grid-cols-2 gap-4">
                {/* Template Section */}
                <div>
                    <div className="space-y-2">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleTemplateSelect(template)}
                                className={`w-full flex items-center gap-2 p-2 rounded-md text-sm ${selectedTemplate === template.id
                                        ? 'bg-white border'
                                        : 'hover:bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {template.icon}
                                    <div className="text-left">
                                        <div>{template.name}</div>
                                        <div className="text-xs opacity-70">
                                            {template.values.top}&quot; {template.values.bottom}&quot; {template.values.left}&quot; {template.values.right}&quot;
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                {/* Manual Input Section */}
                <div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm">Top:</label>
                            <input
                                type="number"
                                step="0.1"
                                value={margins.top}
                                onChange={(e) => handleMarginChange('top', e.target.value)}
                                className="w-12 px-1 py-1 text-sm border rounded bg-white"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm">Bottom:</label>
                            <input
                                type="number"
                                step="0.1"
                                value={margins.bottom}
                                onChange={(e) => handleMarginChange('bottom', e.target.value)}
                                className="w-12 px-1 py-1 text-sm border rounded bg-white"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm">Left:</label>
                            <input
                                type="number"
                                step="0.1"
                                value={margins.left}
                                onChange={(e) => handleMarginChange('left', e.target.value)}
                                className="w-12 px-1 py-1 text-sm border rounded bg-white"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm">Right:</label>
                            <input
                                type="number"
                                step="0.1"
                                value={margins.right}
                                onChange={(e) => handleMarginChange('right', e.target.value)}
                                className="w-12 px-1 py-1 text-sm border rounded bg-white"
                            />
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}

export default MarginModal