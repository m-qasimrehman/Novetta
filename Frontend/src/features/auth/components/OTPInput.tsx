import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const digitCount = 6

export function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(digitCount).fill(''))
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const current = value.split('').slice(0, digitCount)
    setDigits(current.concat(Array(digitCount - current.length).fill('')))
  }, [value])

  const updateValue = (nextDigits: string[]) => {
    setDigits(nextDigits)
    onChange(nextDigits.join(''))
  }

  const handleChange = (index: number, rawValue: string) => {
    const next = rawValue.replace(/[^0-9]/g, '')
    if (!next) {
      return
    }
    const nextDigits = [...digits]
    nextDigits[index] = next[0]
    updateValue(nextDigits)
    const nextInput = inputsRef.current[index + 1]
    nextInput?.focus()
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index]) {
      const prevInput = inputsRef.current[index - 1]
      prevInput?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').trim().replace(/\D/g, '')
    if (!pasted) return
    const nextDigits = Array(digitCount).fill('')
    pasted.slice(0, digitCount).split('').forEach((digit, index) => {
      nextDigits[index] = digit
    })
    updateValue(nextDigits)
  }

  const setInputRef = (index: number) => (element: HTMLInputElement | null) => {
    inputsRef.current[index] = element
  }

  return (
    <div className="grid grid-cols-6 gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={setInputRef(index)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-14 w-full rounded-xl border border-gray-200 bg-white text-center text-xl font-bold text-gray-800 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      ))}
    </div>
  )
}
