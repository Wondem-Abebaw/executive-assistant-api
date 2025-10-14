import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Team Standup' })
  @IsString()
  summary: string;

  @ApiProperty({ example: 'Daily team synchronization', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-10-15T09:00:00Z' })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({ example: '2024-10-15T10:00:00Z' })
  @IsDateString()
  endDateTime: string;

  @ApiProperty({
    example: ['john@example.com', 'jane@example.com'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  attendees?: string[];

  @ApiProperty({ example: 'Conference Room A', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateEventDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDateTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  attendees?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
