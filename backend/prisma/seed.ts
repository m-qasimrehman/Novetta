import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const DAYS = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

async function main() {
  console.log('🌱 Seeding database...')

  // ── Doctors ──────────────────────────────────────────────────────────
  const doctorData = [
    {
      name: 'Dr. Umar Farooq', email: 'umar.doctor@novetta.health',
      specialization: 'General Physician', qualification: 'MBBS, FCPS',
      experience: 12, rating: 4.8, totalReviews: 234,
      about: 'Experienced general physician with over 12 years of practice. Specializes in preventive care and chronic disease management.',
      consultationFee: 1500, city: 'Lahore', location: 'Gulberg III, Lahore',
      languages: ['Urdu', 'English', 'Punjabi'],
      consultationTypes: ['telehealth', 'in-clinic'],
      slots: [
        { day: DAYS.Mon, start: '09:00', end: '13:00' },
        { day: DAYS.Tue, start: '09:00', end: '13:00' },
        { day: DAYS.Wed, start: '14:00', end: '18:00' },
        { day: DAYS.Thu, start: '09:00', end: '13:00' },
        { day: DAYS.Fri, start: '09:00', end: '12:00' },
      ],
    },
    {
      name: 'Dr. Ayesha Malik', email: 'ayesha.doctor@novetta.health',
      specialization: 'Cardiologist', qualification: 'MBBS, MD (Cardiology)',
      experience: 15, rating: 4.9, totalReviews: 312,
      about: 'Leading cardiologist specializing in interventional cardiology, heart failure management, and cardiac imaging.',
      consultationFee: 3000, city: 'Karachi', location: 'Clifton Block 5, Karachi',
      languages: ['Urdu', 'English'],
      consultationTypes: ['telehealth', 'in-clinic'],
      slots: [
        { day: DAYS.Mon, start: '10:00', end: '14:00' },
        { day: DAYS.Wed, start: '10:00', end: '14:00' },
        { day: DAYS.Fri, start: '10:00', end: '13:00' },
      ],
    },
    {
      name: 'Dr. Hassan Raza', email: 'hassan.doctor@novetta.health',
      specialization: 'Dermatologist', qualification: 'MBBS, DDVL',
      experience: 8, rating: 4.7, totalReviews: 189,
      about: 'Expert dermatologist with expertise in medical and cosmetic dermatology, including acne, eczema, and skin cancer.',
      consultationFee: 2000, city: 'Islamabad', location: 'F-7 Markaz, Islamabad',
      languages: ['Urdu', 'English'],
      consultationTypes: ['telehealth', 'in-clinic', 'home-visit'],
      slots: [
        { day: DAYS.Tue, start: '11:00', end: '16:00' },
        { day: DAYS.Thu, start: '11:00', end: '16:00' },
        { day: DAYS.Sat, start: '10:00', end: '14:00' },
      ],
    },
    {
      name: 'Dr. Sana Qureshi', email: 'sana.doctor@novetta.health',
      specialization: 'Pediatrician', qualification: 'MBBS, DCH, FCPS',
      experience: 10, rating: 4.9, totalReviews: 428,
      about: 'Dedicated pediatrician providing comprehensive child healthcare from newborns to adolescents. Certified in neonatal care.',
      consultationFee: 1800, city: 'Lahore', location: 'DHA Phase 5, Lahore',
      languages: ['Urdu', 'English'],
      consultationTypes: ['telehealth', 'in-clinic'],
      slots: [
        { day: DAYS.Mon, start: '09:00', end: '15:00' },
        { day: DAYS.Tue, start: '09:00', end: '15:00' },
        { day: DAYS.Thu, start: '09:00', end: '15:00' },
        { day: DAYS.Sat, start: '09:00', end: '13:00' },
      ],
    },
    {
      name: 'Dr. Imran Sheikh', email: 'imran.doctor@novetta.health',
      specialization: 'Orthopedic Surgeon', qualification: 'MBBS, MS (Ortho), FCPS',
      experience: 18, rating: 4.6, totalReviews: 156,
      about: 'Senior orthopedic surgeon specializing in joint replacement, sports medicine, and spine surgery.',
      consultationFee: 3500, city: 'Karachi', location: 'PECHS Block 6, Karachi',
      languages: ['Urdu', 'English'],
      consultationTypes: ['telehealth', 'in-clinic'],
      slots: [
        { day: DAYS.Mon, start: '14:00', end: '18:00' },
        { day: DAYS.Wed, start: '14:00', end: '18:00' },
        { day: DAYS.Fri, start: '14:00', end: '17:00' },
      ],
    },
    {
      name: 'Dr. Nadia Ahmed', email: 'nadia.doctor@novetta.health',
      specialization: 'Gynecologist', qualification: 'MBBS, FCPS (Obs & Gyne)',
      experience: 13, rating: 4.8, totalReviews: 367,
      about: "Expert gynecologist and obstetrician providing comprehensive women's healthcare including prenatal, postnatal, and reproductive health.",
      consultationFee: 2500, city: 'Islamabad', location: 'G-9 Markaz, Islamabad',
      languages: ['Urdu', 'English'],
      consultationTypes: ['telehealth', 'in-clinic'],
      slots: [
        { day: DAYS.Tue, start: '09:00', end: '14:00' },
        { day: DAYS.Thu, start: '09:00', end: '14:00' },
        { day: DAYS.Sat, start: '09:00', end: '13:00' },
      ],
    },
    {
      name: 'Dr. Bilal Tariq', email: 'bilal.doctor@novetta.health',
      specialization: 'Neurologist', qualification: 'MBBS, MD (Neurology)',
      experience: 11, rating: 4.7, totalReviews: 201,
      about: 'Experienced neurologist specializing in stroke, epilepsy, migraine, and neurodegenerative diseases.',
      consultationFee: 2800, city: 'Lahore', location: 'Johar Town, Lahore',
      languages: ['Urdu', 'English'],
      consultationTypes: ['telehealth', 'in-clinic'],
      slots: [
        { day: DAYS.Mon, start: '10:00', end: '15:00' },
        { day: DAYS.Wed, start: '10:00', end: '15:00' },
        { day: DAYS.Fri, start: '10:00', end: '14:00' },
      ],
    },
    {
      name: 'Dr. Fatima Zahra', email: 'fatima.doctor@novetta.health',
      specialization: 'Psychiatrist', qualification: 'MBBS, MRCPsych',
      experience: 9, rating: 4.9, totalReviews: 298,
      about: 'Compassionate psychiatrist specializing in anxiety, depression, PTSD, and cognitive behavioral therapy (CBT).',
      consultationFee: 2200, city: 'Karachi', location: 'Defence Phase 2, Karachi',
      languages: ['Urdu', 'English', 'Sindhi'],
      consultationTypes: ['telehealth', 'in-clinic'],
      slots: [
        { day: DAYS.Tue, start: '13:00', end: '18:00' },
        { day: DAYS.Thu, start: '13:00', end: '18:00' },
        { day: DAYS.Sat, start: '10:00', end: '14:00' },
      ],
    },
  ]

  for (const doc of doctorData) {
    const passwordHash = await bcrypt.hash('Doctor@123', 12)
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        name: doc.name,
        email: doc.email,
        passwordHash,
        role: 'doctor',
        isVerified: true,
        isActive: true,
      },
    })

    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        about: doc.about,
        consultationFee: doc.consultationFee,
        city: doc.city,
        location: doc.location,
        languages: doc.languages,
        consultationTypes: doc.consultationTypes,
        isOnline: Math.random() > 0.5,
      },
    })

    for (const slot of doc.slots) {
      const existing = await prisma.availabilitySlot.findFirst({
        where: { doctorId: doctor.id, dayOfWeek: slot.day, startTime: slot.start },
      })
      if (!existing) {
        await prisma.availabilitySlot.create({
          data: { doctorId: doctor.id, dayOfWeek: slot.day, startTime: slot.start, endTime: slot.end, slotDurationMin: 30 },
        })
      }
    }

    console.log(`  ✓ Doctor: ${doc.name}`)
  }

  // ── Medicines ─────────────────────────────────────────────────────────
  const medicines = [
    { name: 'Panadol 500mg', genericName: 'Paracetamol', manufacturer: 'GSK', category: 'Analgesics', price: 45, unit: 'Strip of 10', description: 'Pain reliever and fever reducer' },
    { name: 'Brufen 400mg', genericName: 'Ibuprofen', manufacturer: 'Abbott', category: 'Analgesics', price: 65, unit: 'Strip of 10', description: 'Anti-inflammatory pain reliever' },
    { name: 'Aspirin 75mg', genericName: 'Acetylsalicylic acid', manufacturer: 'Bayer', category: 'Analgesics', price: 35, unit: 'Strip of 30', description: 'Blood thinner and pain reliever' },
    { name: 'Voltaren Gel', genericName: 'Diclofenac', manufacturer: 'Novartis', category: 'Analgesics', price: 285, unit: '50g Tube', description: 'Topical pain relief gel' },
    { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', manufacturer: 'Searle', category: 'Antibiotics', price: 120, unit: 'Strip of 6', description: 'Broad-spectrum antibiotic' },
    { name: 'Augmentin 625mg', genericName: 'Amoxicillin/Clavulanate', manufacturer: 'GSK', category: 'Antibiotics', price: 380, unit: 'Strip of 6', description: 'Extended-spectrum antibiotic' },
    { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', manufacturer: 'Bayer', category: 'Antibiotics', price: 210, unit: 'Strip of 10', description: 'Fluoroquinolone antibiotic' },
    { name: 'Azithromycin 500mg', genericName: 'Azithromycin', manufacturer: 'Pfizer', category: 'Antibiotics', price: 290, unit: 'Pack of 3', description: 'Macrolide antibiotic' },
    { name: 'Lopressor 50mg', genericName: 'Metoprolol', manufacturer: 'Novartis', category: 'Cardiovascular', price: 180, unit: 'Strip of 30', description: 'Beta-blocker for hypertension' },
    { name: 'Amlodipine 5mg', genericName: 'Amlodipine', manufacturer: 'Pfizer', category: 'Cardiovascular', price: 95, unit: 'Strip of 30', description: 'Calcium channel blocker' },
    { name: 'Atorvastatin 20mg', genericName: 'Atorvastatin', manufacturer: 'Pfizer', category: 'Cardiovascular', price: 150, unit: 'Strip of 30', description: 'Cholesterol-lowering statin' },
    { name: 'Lisinopril 10mg', genericName: 'Lisinopril', manufacturer: 'Merck', category: 'Cardiovascular', price: 130, unit: 'Strip of 30', description: 'ACE inhibitor for heart failure' },
    { name: 'Nexium 40mg', genericName: 'Esomeprazole', manufacturer: 'AstraZeneca', category: 'Gastrointestinal', price: 320, unit: 'Strip of 14', description: 'Proton pump inhibitor for acid reflux' },
    { name: 'Buscopan 10mg', genericName: 'Hyoscine', manufacturer: 'Sanofi', category: 'Gastrointestinal', price: 85, unit: 'Strip of 10', description: 'Antispasmodic for stomach cramps' },
    { name: 'Flagyl 400mg', genericName: 'Metronidazole', manufacturer: 'Sanofi', category: 'Gastrointestinal', price: 55, unit: 'Strip of 10', description: 'Antibiotic for GI infections' },
    { name: 'ORS Sachets', genericName: 'Oral Rehydration Salts', manufacturer: 'Various', category: 'Gastrointestinal', price: 25, unit: 'Pack of 20', description: 'Electrolyte replacement therapy' },
    { name: 'Metformin 500mg', genericName: 'Metformin', manufacturer: 'Merck', category: 'Diabetes', price: 70, unit: 'Strip of 30', description: 'First-line diabetes medication' },
    { name: 'Glucophage XR 1000mg', genericName: 'Metformin Extended Release', manufacturer: 'Merck', category: 'Diabetes', price: 180, unit: 'Strip of 30', description: 'Extended-release diabetes medication' },
    { name: 'Lantus 100U/ml', genericName: 'Insulin Glargine', manufacturer: 'Sanofi', category: 'Diabetes', price: 850, unit: '10ml Vial', description: 'Long-acting insulin analogue' },
    { name: 'Salbutamol Inhaler', genericName: 'Albuterol', manufacturer: 'GSK', category: 'Respiratory', price: 420, unit: '200 doses', description: 'Bronchodilator for asthma relief' },
    { name: 'Allegra 120mg', genericName: 'Fexofenadine', manufacturer: 'Sanofi', category: 'Respiratory', price: 195, unit: 'Strip of 10', description: 'Non-drowsy antihistamine' },
    { name: 'Flixonase Nasal Spray', genericName: 'Fluticasone', manufacturer: 'GSK', category: 'Respiratory', price: 380, unit: '150 doses', description: 'Corticosteroid nasal spray' },
    { name: 'Vitamin C 1000mg', genericName: 'Ascorbic acid', manufacturer: 'Redoxon', category: 'Vitamins', price: 280, unit: 'Pack of 30', description: 'Immune support vitamin' },
    { name: 'Vitamin D3 5000IU', genericName: 'Cholecalciferol', manufacturer: 'Various', category: 'Vitamins', price: 350, unit: 'Pack of 60', description: 'Bone health and immune support' },
    { name: 'Omega-3 Fish Oil', genericName: 'EPA/DHA', manufacturer: 'Naturelo', category: 'Vitamins', price: 650, unit: 'Pack of 60', description: 'Heart and brain health supplement' },
    { name: 'Iron + Folic Acid', genericName: 'Ferrous Sulfate + Folic Acid', manufacturer: 'Various', category: 'Vitamins', price: 120, unit: 'Strip of 30', description: 'Essential minerals for pregnancy' },
    { name: 'Hydrocortisone Cream 1%', genericName: 'Hydrocortisone', manufacturer: 'Various', category: 'Dermatology', price: 95, unit: '15g Tube', description: 'Mild corticosteroid for skin inflammation' },
    { name: 'Clotrimazole Cream', genericName: 'Clotrimazole', manufacturer: 'Bayer', category: 'Dermatology', price: 75, unit: '20g Tube', description: 'Antifungal cream' },
    { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', manufacturer: 'UCB', category: 'Dermatology', price: 45, unit: 'Strip of 10', description: 'Antihistamine for skin allergies' },
    { name: 'Tretinoin Cream 0.025%', genericName: 'Tretinoin', manufacturer: 'Various', category: 'Dermatology', price: 480, unit: '20g Tube', description: 'Retinoid for acne and anti-aging' },
  ]

  for (const med of medicines) {
    const existing = await prisma.medicine.findFirst({ where: { name: med.name } })
    if (!existing) {
      await prisma.medicine.create({ data: med })
    }
  }
  console.log(`  ✓ ${medicines.length} medicines seeded`)

  console.log('✅ Database seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
