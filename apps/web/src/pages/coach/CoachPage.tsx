import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { api } from '@/api/client'
import { clsx } from 'clsx'

interface Message {
  role: 'user' | 'coach'
  content: string
}

export function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const { reply } = await api.post<{ reply: string }>('/ai/chat', { message: text })
      setMessages((prev) => [...prev, { role: 'coach', content: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'coach', content: 'Something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Coach</h1>
        <p className="text-sm text-stone-500 mt-0.5">A thinking partner that knows your mountains.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-400 text-sm leading-relaxed">
              Open a conversation.
              <br />
              The coach knows your mountains, hills, and today's energy.
            </p>
            <div className="flex flex-col gap-2 mt-6 text-left">
              {[
                'How is my training block going?',
                'I had a hard week — what should I do differently?',
                'What trade-offs am I facing this week?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-sm text-stone-500 px-4 py-3 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={clsx(
                'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-800'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="h-1.5 w-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="h-1.5 w-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="h-1.5 w-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 pt-2 border-t border-stone-100">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={1}
          className="flex-1 px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-stone-300"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
