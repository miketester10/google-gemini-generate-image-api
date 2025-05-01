import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class BasePromptDto {
  @IsString()
  @Length(2)
  @Transform(({ value }) => typeof value === 'string' && value.trim())
  prompt: string;
}
