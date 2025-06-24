import React, { useEffect, useState } from 'react'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { useModal } from '@/contexts/ModelContext'
import axios from 'axios'

const ConfigModal = () => {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [hasExistingKey, setHasExistingKey] = useState(false)
  const { hideModal } = useModal()

  useEffect(() => {
    axios.get('/api/credential')
      .then((res) => {
        if (res.data?.decoded?.data) {
          setApiKey(res.data.decoded.data)
          setHasExistingKey(true)
        }
      })
      .catch((err) => {
        console.warn('No saved API key found:', err.response?.data || err.message)
        setHasExistingKey(false)
      })
  }, [])

  const handleDelete = () => {
    axios.delete('/api/credential')
      .then(() => {
        setApiKey('')
        setHasExistingKey(false)
        setError('')
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to delete API key. Please try again.')
      })
  }

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key is required')
      return
    }

    if (!apiKey.startsWith('AIza')) {
      setError('Invalid Gemini API key format')
      return
    }

    axios.post('/api/credential', { apiKey }).then(() => {
      setError('');
      hideModal();
      setApiKey('');
    })
      .catch((err) => {
        console.error(err);
        setError('Failed to save API key. Please try again.');
      })

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
            placeholder="AIza..."
            className="w-full px-3 py-2 pr-20 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dblue focus:border-transparent transition-all"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {hasExistingKey && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-zinc-400 hover:text-red-500/80 transition-colors"
                title="Delete API Key"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600/75">{error}</p>
        )}
      </div>

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