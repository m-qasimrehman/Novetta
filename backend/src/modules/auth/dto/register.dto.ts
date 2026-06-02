import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, Min, MinLength } from 'class-validator'

export class RegisterDto {
  @IsNotEmpty()
  @MinLength(3)
  name!: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsPhoneNumber()
  phone?: string

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain a lowercase letter' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain an uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain a number' })
  @Matches(/(?=.*[^A-Za-z0-9])/, { message: 'Password must contain a special character' })
  password!: string

  @IsOptional()
  @IsIn(['patient', 'doctor'])
  role?: 'patient' | 'doctor'

  // Doctor-specific fields (only required when role === 'doctor')
  @IsOptional()
  @IsString()
  specialization?: string

  @IsOptional()
  @IsString()
  qualification?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  experience?: number

  @IsOptional()
  @IsString()
  city?: string
}
