import { Apple, Globe } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

export function SocialLoginButtons() {
  return (
    <div className="grid gap-3">
      <Button type="button" variant="secondary" className="justify-start gap-3 text-gray-700">
        <Globe className="h-5 w-5" />
        Continue with Google
      </Button>
      <Button type="button" variant="secondary" className="justify-start gap-3 text-gray-700">
        <Apple className="h-5 w-5" />
        Continue with Apple
      </Button>
    </div>
  )
}
