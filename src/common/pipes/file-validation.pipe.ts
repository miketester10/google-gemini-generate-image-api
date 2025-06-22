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
      throw new BadRequestException('The uploaded file must be an image.');
    }

    // Verifico se il MIME type del file caricato corrisponde al MIME type del file dopo aver controllato il magic number.
    // Se corrisponde ed è un JPEG, ritorno il file. Altrimenti, converto l'immagine in JPEG e ritorno il file.
    // if (file.mimetype === fileType.mime && fileType.mime === 'image/jpeg') {
    //   return file;
    // } else {
    //   this.logger.verbose(
    //     `Mismatch mimetype between file uploaded: ${file.mimetype} and file after checking magic number: ${fileType.mime}.`,
    //   );
    // }

    // Converto l'immagine in JPEG usando sharp
    // (anche se è già in JPEG la converto lo stesso, poichè con alcuni file JPEG senza conversione Google AI da errore)
    try {
      this.logger.verbose(
        `Converting file with mimetype ${fileType.mime} to JPEG.`,
      );

      const convertedImage = await sharp(file.buffer).jpeg().toBuffer();

      this.logger.verbose(
        `Converted image size: ${(convertedImage.length / (1024 * 1024)).toFixed(2)} MB`,
      );

      // Aggiorno i metadati del file
      file.buffer = convertedImage;
      file.size = convertedImage.length;
      file.mimetype = 'image/jpeg';
      file.originalname = path.parse(file.originalname).name + '.jpeg';
      return file;
    } catch (error) {
      this.logger.error(
        `An error occurred while converting the uploaded image: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        'An error occurred while converting the uploaded image.',
      );
    }
  }
}
