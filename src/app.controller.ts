import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Observable } from 'rxjs';
import { Model } from './interfaces/google-ai-models-response.interface';
import { BasePromptDto } from './dto/base-prompt.dto';
import { Readable } from 'stream';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from './common/pipes/file-validation.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('generate-image')
  async generateImage(
    @Body() basePromptDto: BasePromptDto,
    @Res() res: Response,
  ): Promise<void> {
    const { prompt } = basePromptDto;
    const buffer = await this.appService.generateImage(prompt);

    const stream = Readable.from(buffer);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="image.png"',
      'Content-Length': buffer.length,
    });

    stream.pipe<Response>(res);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('edit-image')
  async editImage(
    @Body() basePromptDto: BasePromptDto,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const { prompt } = basePromptDto;
    const buffer = await this.appService.editImage(prompt, file);
    const stream = Readable.from(buffer);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="image.png"',
      'Content-Length': buffer.length,
    });

    stream.pipe<Response>(res);
  }

  @Get('models')
  getGoogleAiMmodels(): Observable<Model[]> {
    const models = this.appService.getGoogleAiModels();
    return models;
  }
}
