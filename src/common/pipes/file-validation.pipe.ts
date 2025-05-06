import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as FileType from 'file-type';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly logger = new Logger(FileValidationPipe.name);
  private readonly allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp']; /// Gemini attualmente supporta solo questi mimetype

  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (!file) {
      throw new BadRequestException('No file was uploaded.');
    }

    // Verifico se il MIME type inizia con 'image/'
    const fileType = await FileType.fromBuffer(file.buffer); // Stabilisce il mimetype controllando il magic number del buffer. Più sicuro.
    if (!fileType || !fileType.mime.startsWith('image/')) {
      this.logger.verbose(
        `File with mimetype ${file.mimetype} is not an image.`,
      );
      throw new BadRequestException(
        'The uploaded file must be an image. Please ensure the image has a .png, .jpeg, or .webp extension.',
      );
    }

    // Se il formato è già PNG, JPEG o WebP, ritorno direttamente il file
    if (this.allowedMimeTypes.includes(file.mimetype)) {
      this.logger.verbose(
        `File with mimetype ${file.mimetype} is already PNG, JPEG or WebP.`,
      );
      return file;
    }

    try {
      this.logger.verbose(
        `Converting file with mimetype ${file.mimetype} to PNG.`,
      );
      // Converto l'immagine in PNG usando sharp
      const convertedImage = await sharp(file.buffer)
        .png({ compressionLevel: 9 })
        .toBuffer();

      // Aggiorno i metadati del file
      file.buffer = convertedImage;
      file.mimetype = 'image/png';
      file.originalname = path.parse(file.originalname).name + '.png';
      return file;
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
      throw new BadRequestException(
        'An error occurred while converting the uploaded image. Please ensure the image has a .png, .jpeg, or .webp extension.',
      );
    }
  }
}
