import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from './Input'

interface PasswordInputProps {
  label?: string
  error?: string
  helperText?: string
  value?: string
  name: string
  placeholder?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function PasswordInput({ label, error, helperText, name, placeholder, value, onChange }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <Input
        label={label}
        error={error}
        helperText={helperText}
        name={name}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        icon={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="text-gray-400 transition hover:text-gray-600"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />
    </div>
  )
}
