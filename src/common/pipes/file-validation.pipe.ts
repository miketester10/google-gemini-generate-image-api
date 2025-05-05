import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    // const maxSize = 19 * 1024 * 1024;
    // if (file.size > maxSize) {
    //   throw new BadRequestException('Il file supera i 19MB');
    // }

    // const allowedMimeTypes = ['image/png', 'image/jpeg'];
    // if (!allowedMimeTypes.includes(file.mimetype)) {
    //   throw new BadRequestException(
    //     'Formato file non supportato (solo PNG o JPEG)',
    //   );
    // }

    return file;
  }
}
