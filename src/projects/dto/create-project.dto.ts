import {
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

function parseJsonField({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function toBoolean({ value }: { value: unknown }) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }
  return value;
}

function toStringArray({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch {
      return trimmed
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return value;
}

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  projectType?: string;

  @IsString()
  @MinLength(2)
  desc!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  client?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  timeline?: string;

  @IsOptional()
  @IsString()
  services?: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsString()
  challenge?: string;

  @IsOptional()
  @IsString()
  solution?: string;

  @IsOptional()
  @IsString()
  clientRequirement?: string;

  @IsOptional()
  @IsString()
  howWeFulfilled?: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  keyFeatures?: string[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  process?: string[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  outcomes?: string[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Transform(parseJsonField)
  results?: Array<{ number: string; label: string }>;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ctaTitle?: string;

  @IsOptional()
  @Transform(parseJsonField)
  @IsObject()
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };

  @IsOptional()
  @IsString()
  accent?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'in_progress', 'completed', 'archived'])
  status?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isFeatured?: boolean;
}
