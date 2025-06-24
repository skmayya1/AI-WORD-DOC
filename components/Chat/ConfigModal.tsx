import React, { useState } from 'react'
import { Eye, EyeOff, Key, X } from 'lucide-react'
import { useModal } from '@/contexts/ModelContext'

const ConfigModal = () => {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const { hideModal} = useModal()

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key is required')
      return
    }
    
    if (!apiKey.startsWith('AIza')) {
      setError('Invalid Gemini API key format')
      return
    }

    setError('')
  }

  const handleCancel = () => {
    hideModal()
    setApiKey('')
    setError('')
  }

  return (
      <div className='w-full max-w-md rounded-xl border border-zinc-200 bg-white shadow-lg p-6 relative'>
        {/* Input field */}
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-zinc-700 mb-2">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              id="apiKey"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setError('')
              }}
              placeholder="XIza..."
              className="w-full px-3 py-2 pr-10 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Help text */}
        <div className="mb-6">
          <p className="text-xs text-dblue">
           <a href=" https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className='underline'>
           Get your API key from Google AI Studio.</a>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 px-4 py-2 bg-xblue/70 text-white rounded-lg hover:bg-xblue/50 cursor-pointer disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Save & Continue
          </button>
        </div>
      </div>
  )
}

export default ConfigModal