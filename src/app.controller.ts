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
  ) {
    const { prompt } = basePromptDto;
    const buffer = await this.appService.generateImage(prompt);

    this.setHeaders(res, buffer);

    return this.createStream(res, buffer);
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

    this.setHeaders(res, buffer);

    return this.createStream(res, buffer);
  }

  @Get('models')
  getGoogleAiModels(): Observable<Model[]> {
    const models = this.appService.getGoogleAiModels();
    return models;
  }

  private setHeaders(res: Response, buffer: Buffer): void {
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="image.png"',
      'Content-Length': buffer.length,
    });
  }

  private createStream(res: Response, buffer: Buffer) {
    const stream = Readable.from(buffer);
    return stream.pipe<Response>(res);
  }
}
