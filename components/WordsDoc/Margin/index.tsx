import React, { useState } from 'react'
import { FileText, Maximize2, Minimize2 } from 'lucide-react'
import { useEditorContext } from '@/contexts/EditorContext';

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
            icon: <FileText className="w-4 h-4"  />,
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
        const numValue = parseFloat(value);
        if (value === '' || (numValue >= 0 && !isNaN(numValue))) {
            setMargins(prev => ({
                ...prev,
                [field]: value === '' ? 0 : numValue
            }));
            setSelectedTemplate('custom');
        }
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
            <div className='w-full max-w-md rounded-xl border border-zinc-200 bg-white shadow-lg p-6'>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Page Margins</h3>
                    <p className="text-sm text-gray-600">Set margins in inches</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Presets</h4>
                        <div className="space-y-2">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all duration-200 ${
                                        selectedTemplate === template.id
                                            ? 'bg-blue-50 border border-blue-200 text-xblue'
                                            : 'hover:bg-gray-50 border border-transparent text-zinc-600'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-md ${
                                        selectedTemplate === template.id ? 'bg-blue-100' : 'bg-gray-100'
                                    }`}>
                                        {template.icon}
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-xs opacity-70">
                                            {template.values.top}&quot; · {template.values.bottom}&quot; · {template.values.left}&quot; · {template.values.right}&quot;
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Manual Input Section */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Values</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Top</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={margins.top}
                                        onChange={(e) => handleMarginChange('top', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0.0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Left</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={margins.left}
                                        onChange={(e) => handleMarginChange('left', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Bottom</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={margins.bottom}
                                        onChange={(e) => handleMarginChange('bottom', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0.0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Right</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={margins.right}
                                        onChange={(e) => handleMarginChange('right', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default MarginModal