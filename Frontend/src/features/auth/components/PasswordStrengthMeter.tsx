interface PasswordStrengthMeterProps {
  password: string
}

const strengthLabels = ['Very weak', 'Weak', 'Good', 'Strong', 'Secure']

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const tests = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
    password.length >= 8,
  ]
  const score = tests.filter(Boolean).length
  const progress = (score / tests.length) * 100

  return (
    <div className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            backgroundColor: score <= 1 ? '#ef4444' : score <= 3 ? '#f59e0b' : '#22c55e',
          }}
        />
      </div>
      <p className="text-xs text-gray-500">{strengthLabels[Math.max(0, score - 1)]}</p>
    </div>
  )
}
