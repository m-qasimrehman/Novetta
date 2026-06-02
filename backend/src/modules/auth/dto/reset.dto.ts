import { IsNotEmpty, IsOptional, MinLength, Matches } from 'class-validator'

export class ResetPasswordDto {
  @IsNotEmpty()
  token!: string

  @IsOptional()
  code?: string

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain a lowercase letter' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain an uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain a number' })
  @Matches(/(?=.*[^A-Za-z0-9])/, { message: 'Password must contain a special character' })
  password!: string
}
