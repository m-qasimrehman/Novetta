import { IsNotEmpty, IsNumberString, Length } from 'class-validator'

export class VerifyOtpDto {
  @IsNotEmpty()
  token!: string

  @IsNumberString()
  @Length(6, 6)
  code!: string
}

export class ResendOtpDto {
  @IsNotEmpty()
  identifier!: string
}
