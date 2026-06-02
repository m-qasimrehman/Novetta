import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  ScanLine, Upload, AlertCircle,
  ShoppingCart, Plus, Minus, Trash2, ArrowRight, Loader2,
} from 'lucide-react'
import { Navbar } from '../../../components/layouts/Navbar'
import { Footer } from '../../../components/layouts/Footer'
import { pharmacyApi, type OcrResult } from '../../../lib/api'
import { ROUTES } from '../../../constants/routes'

interface CartItem { medicine: OcrResult; quantity: number }

export function PrescriptionScanPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [results, setResults] = useState<OcrResult[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<'upload' | 'review' | 'cart'>('upload')

  const scanMutation = useMutation({
    mutationFn: (file: File) => pharmacyApi.scanPrescription(file),
    onSuccess: (res) => {
      const meds = res.data?.medicines ?? []
      setResults(meds)
      const initialCart = meds
        .filter(m => m.inStock)
        .map(m => ({ medicine: m, quantity: 1 }))
      setCart(initialCart)
      setStep('review')
    },
  })

  const handleFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    scanMutation.mutate(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  const addToCart = (med: OcrResult) => {
    setCart(prev => {
      const existing = prev.find(i => i.medicine.id === med.id)
      if (existing) return prev.map(i => i.medicine.id === med.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { medicine: med, quantity: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.medicine.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0))
  }

  const totalAmount = cart.reduce((s, i) => s + Number(i.medicine.price) * i.quantity, 0)

  const proceedToOrder = () => {
    // Encode cart to state and redirect to pharmacy with pre-filled cart
    const params = new URLSearchParams()
    cart.forEach(i => params.append('med', `${i.medicine.id}:${i.quantity}`))
    navigate(`${ROUTES.pharmacy}?fromScan=1&${params.toString()}`)
  }

  const confidenceColor = (c: number) =>
    c >= 90 ? 'text-green-600 bg-green-50' : c >= 80 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <ScanLine className="h-5 w-5 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Prescription Scanner</h1>
          </div>
          <p className="text-sm text-gray-500 ml-13">Upload a prescription image and we'll automatically extract the medicines</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center gap-2">
          {[
            { id: 'upload', label: 'Upload' },
            { id: 'review', label: 'Review' },
            { id: 'cart', label: 'Order' },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === s.id ? 'bg-brand-500 text-white' : ['review', 'cart'].includes(step) && i < ['upload', 'review', 'cart'].indexOf(step) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {['review', 'cart'].includes(step) && i < ['upload', 'review', 'cart'].indexOf(step) ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-semibold ${step === s.id ? 'text-brand-600' : 'text-gray-400'}`}>{s.label}</span>
              {i < 2 && <ArrowRight className="h-4 w-4 text-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div
              className="rounded-2xl border-2 border-dashed border-brand-300 bg-white p-10 text-center hover:border-brand-400 hover:bg-brand-50 transition-all cursor-pointer"
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <Upload className="mx-auto h-12 w-12 text-brand-300 mb-4" />
              <p className="text-lg font-semibold text-gray-700">Drop your prescription here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse — JPG, PNG, PDF supported</p>
              <button className="mt-4 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                Choose File
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>

            {scanMutation.isPending && (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-brand-200 bg-brand-50 p-6">
                <Loader2 className="h-6 w-6 text-brand-500 animate-spin" />
                <div>
                  <p className="font-semibold text-brand-700">Scanning prescription...</p>
                  <p className="text-xs text-brand-500">Extracting medicine names with OCR</p>
                </div>
              </div>
            )}

            {preview && !scanMutation.isPending && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
                <img src={preview} alt="prescription" className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{fileName}</p>
                  <p className="text-xs text-gray-400">Ready to scan</p>
                </div>
              </div>
            )}

            {scanMutation.isError && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">Scan failed. Please try again with a clearer image.</p>
              </div>
            )}

            {/* Tips */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Tips for better results</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                {[
                  'Use good lighting when photographing your prescription',
                  'Keep the prescription flat and avoid shadows',
                  'Make sure all text is clearly visible',
                  'Capture the entire prescription in the frame',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Review Extracted Medicines */}
        {step === 'review' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Extracted Medicines</h2>
                <p className="text-sm text-gray-500">{results.length} medicines found in your prescription</p>
              </div>
              <button
                onClick={() => { setStep('upload'); setResults([]); setPreview(null) }}
                className="flex items-center gap-1.5 text-sm text-brand-500 hover:underline"
              >
                <ScanLine className="h-4 w-4" /> Scan again
              </button>
            </div>

            {preview && (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <img src={preview} alt="prescription" className="w-full max-h-48 object-cover" />
              </div>
            )}

            <div className="space-y-3">
              {results.map(med => {
                const inCart = cart.find(i => i.medicine.id === med.id)
                return (
                  <div key={med.id} className={`rounded-xl border p-4 transition-all ${inCart ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{med.name}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${confidenceColor(med.confidence)}`}>
                            {med.confidence}% match
                          </span>
                          {!med.inStock && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">Out of stock</span>}
                        </div>
                        {med.genericName && <p className="text-xs text-gray-400 mt-0.5">{med.genericName}</p>}
                        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>Dose: <strong>{med.dosage}</strong></span>
                          <span>Freq: <strong>{med.frequency}</strong></span>
                          <span>Duration: <strong>{med.duration}</strong></span>
                          <span className="text-brand-600 font-bold">PKR {Number(med.price).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {inCart ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => updateQty(med.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{inCart.quantity}</span>
                            <button onClick={() => updateQty(med.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setCart(p => p.filter(i => i.medicine.id !== med.id))} className="ml-1 text-red-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(med)}
                            disabled={!med.inStock}
                            className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {cart.length > 0 && (
              <div className="sticky bottom-4 rounded-2xl border border-brand-300 bg-white shadow-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">{cart.length} items · PKR {totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Ready to order</p>
                </div>
                <button
                  onClick={proceedToOrder}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 font-semibold text-white hover:bg-brand-600"
                >
                  <ShoppingCart className="h-4 w-4" /> Order Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
