import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessCommandDto {
  @ApiProperty({ example: 'Schedule a meeting with John next Tuesday at 2pm' })
  @IsString()
  command: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsString()
  userEmail?: string;
}

export class GenerateSummaryDto {
  @ApiProperty({ example: 'Long text that needs to be summarized...' })
  @IsString()
  text: string;
}

export class SuggestResponseDto {
  @ApiProperty({
    example: 'Customer asked about pricing for enterprise plan...',
  })
  @IsString()
  context: string;
}
