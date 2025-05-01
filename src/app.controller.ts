import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Observable } from 'rxjs';
import { Model } from './interfaces/google-ai-models-response.interface';
import { BasePromptDto } from './dto/base-prompt.dto';
import { Readable } from 'stream';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('generate-image')
  async generateImage(
    @Body() basePromptDto: BasePromptDto,
    @Res() res: Response,
  ): Promise<void> {
    const { prompt } = basePromptDto;
    const buffer = await this.appService.genereteImage(prompt);

    const stream = Readable.from(buffer);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="image.png"',
      'Content-Length': buffer.length,
    });

    stream.pipe(res);
  }

  @Get('models')
  getGoogleAiMmodels(): Observable<Model[]> {
    const models = this.appService.getGoogleAiModels();
    return models;
  }
}
