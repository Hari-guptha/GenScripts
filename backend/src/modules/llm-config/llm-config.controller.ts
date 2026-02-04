import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LLMConfigService } from './llm-config.service';
import { CreateLLMConfigDto } from './dto/create-llm-config.dto';
import { UpdateLLMConfigDto } from './dto/update-llm-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('llm-config')
@UseGuards(JwtAuthGuard)
export class LLMConfigController {
  constructor(private readonly llmConfigService: LLMConfigService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateLLMConfigDto) {
    return this.llmConfigService.create(req.user._id.toString(), createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.llmConfigService.findAll(req.user._id.toString());
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.llmConfigService.findOne(id, req.user._id.toString());
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateLLMConfigDto) {
    return this.llmConfigService.update(id, req.user._id.toString(), updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.llmConfigService.remove(id, req.user._id.toString());
  }

  @Post(':id/test')
  testConnection(@Request() req, @Param('id') id: string) {
    return this.llmConfigService.testConnection(id, req.user._id.toString());
  }
}
