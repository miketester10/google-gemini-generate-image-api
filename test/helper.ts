import { AppService } from 'src/app.service';

/** Helper functions per creare buffer di immagini di test */
// Immagine PNG minimale valida (1x1 pixel)
export const createTestImagePngBuffer = (): Buffer => {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );
};
// Immagine JPEG minimale valida (1x1 pixel)
export const createTestImageJpegBuffer = (): Buffer => {
  return Buffer.from(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
    'base64',
  );
};
// Immagine WebP minimale valida (1x1 pixel)
export const createTestImageWebpBuffer = (): Buffer => {
  return Buffer.from(
    'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
    'base64',
  );
};

/** Mock di AppService per i test */
type AppServiceMock = jest.Mocked<
  Pick<AppService, 'getGoogleAiModels' | 'generateImage' | 'editImage'>
>;

export const appServiceMock: AppServiceMock = {
  getGoogleAiModels: jest.fn().mockResolvedValue([
    {
      name: 'models/test-model',
      version: '1.0',
      displayName: 'Test Model',
      description: 'A model for testing purposes',
      inputTokenLimit: 1024,
      outputTokenLimit: 2048,
      supportedGenerationMethods: ['text', 'image'],
    },
  ]),
  generateImage: jest.fn().mockResolvedValue(createTestImagePngBuffer()),
  editImage: jest.fn().mockResolvedValue(createTestImagePngBuffer()),
};
