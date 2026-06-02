import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

const links = {
  'Our Policies': ['Privacy Policy', 'Terms & Conditions', 'Editorial Policy', 'Return Policy'],
  'Need Help': ['Customer Support', 'Feedback', 'Report a Problem'],
  'More': ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
  'Our Services': ['Order Medicines', 'Lab Tests', 'Consult Doctors', 'Surgery Care'],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="mb-3 text-sm font-bold text-gray-800 uppercase tracking-wider">{section}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 hover:text-brand-500">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xl font-black text-brand-500">Novetta</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Novetta Health Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to={ROUTES.login} className="text-xs text-gray-500 hover:text-brand-500">Login</Link>
            <Link to={ROUTES.register} className="text-xs text-gray-500 hover:text-brand-500">Register</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
