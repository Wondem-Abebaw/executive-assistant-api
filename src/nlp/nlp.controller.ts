import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NlpService } from './nlp.service';
import { ProcessCommandDto, GenerateSummaryDto, SuggestResponseDto } from './dto/nlp.dto';

@ApiTags('nlp')
@Controller('nlp')
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Post('process')
  @ApiOperation({ summary: 'Process a natural language command' })
  async processCommand(@Body() dto: ProcessCommandDto) {
    return this.nlpService.processCommand(dto.command, dto.userEmail);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Generate a summary of text' })
  async generateSummary(@Body() dto: GenerateSummaryDto) {
    const summary = await this.nlpService.generateSummary(dto.text);
    return { summary };
  }

  @Post('suggest-response')
  @ApiOperation({ summary: 'Suggest an email response' })
  async suggestResponse(@Body() dto: SuggestResponseDto) {
    const suggestion = await this.nlpService.suggestResponse(dto.context);
    return { suggestion };
  }
}
