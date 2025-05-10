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
  private readonly allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp']; // Gemini attualmente supporta solo questi mimetype

  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (!file) {
      this.logger.verbose(`No file was uploaded.`);
      throw new BadRequestException('No file was uploaded.');
    }

    // Stabilisce il mimetype controllando il magic number del buffer. Più sicuro.
    const fileType = await FileType.fromBuffer(file.buffer);
    // Verifico se il MIME type è definito ed inizia con 'image/' (poichè se viene inviato per esempio un file .txt, il metodo FileType.fromBuffer(file.buffer) non riesce a stabilire il MIME type e riorna undefined)
    if (!fileType || !fileType.mime.startsWith('image/')) {
      this.logger.verbose(
        `File with mimetype ${fileType?.mime} is not an image.`,
      );
      throw new BadRequestException(
        'The uploaded file must be an image. Please ensure the image has a .png, .jpeg, or .webp extension.',
      );
    }

    // Se il formato è già PNG, JPEG o WebP, ritorno direttamente il file
    if (this.allowedMimeTypes.includes(fileType.mime)) {
      this.logger.verbose(
        `File with mimetype ${fileType.mime} is already PNG, JPEG or WebP.`,
      );
      file.mimetype = fileType.mime;
      return file;
    }

    // Converto l'immagine in PNG usando sharp
    try {
      this.logger.verbose(
        `Converting file with mimetype ${fileType.mime} to PNG.`,
      );

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
