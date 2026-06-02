import { IsNotEmpty } from 'class-validator'

export class ForgotPasswordDto {
  @IsNotEmpty()
  identifier!: string
}
