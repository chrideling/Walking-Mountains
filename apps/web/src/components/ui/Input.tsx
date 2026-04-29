import { clsx } from 'clsx'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'w-full px-3 py-2 bg-white border rounded-xl text-stone-900 placeholder-stone-400 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400',
          error ? 'border-red-300' : 'border-stone-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={clsx(
          'w-full px-3 py-2 bg-white border rounded-xl text-stone-900 placeholder-stone-400 text-sm transition-colors resize-none',
          'focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400',
          error ? 'border-red-300' : 'border-stone-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
