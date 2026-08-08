import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message!: string;

  /** Selected service from website contact form */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  service?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  projectType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  estimatedBudget?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  preferredTimeline?: string;
}
