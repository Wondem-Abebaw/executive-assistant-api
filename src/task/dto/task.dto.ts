import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Review project proposal' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Review and provide feedback on the new project proposal',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-10-20T17:00:00Z' })
  @IsDateString()
  dueDate: Date;

  @ApiProperty({ example: 'high', enum: ['low', 'medium', 'high'] })
  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
  })
  @IsEnum(['pending', 'in-progress', 'completed', 'cancelled'])
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ example: ['urgent', 'client-work'], required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['pending', 'in-progress', 'completed', 'cancelled'])
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
