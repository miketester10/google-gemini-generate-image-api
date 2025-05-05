import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as FileType from 'file-type';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    const fileType = await FileType.fromBuffer(file.buffer);
    if (!fileType || !fileType.mime.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed.');
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
