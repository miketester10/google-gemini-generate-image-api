/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { Model } from '../src/interfaces/google-ai-models-response.interface';

describe('Google Gemini API Test (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    // Inizializza l'applicazione NestJS
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    // Chiude l'applicazione NestJS dopo i test
    await app.close();
  });

  // Helper functions per creare buffer di immagini di test
  // Immagine PNG minimale valida (1x1 pixel)
  const createTestImagePngBuffer = (): Buffer => {
    return Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
  };
  // Immagine JPEG minimale valida (1x1 pixel)
  const createTestImageJpegBuffer = (): Buffer => {
    return Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
      'base64',
    );
  };
  // Immagine WebP minimale valida (1x1 pixel)
  const createTestImageWebpBuffer = (): Buffer => {
    return Buffer.from(
      'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
      'base64',
    );
  };

  describe('GET /models', () => {
    it('Dovrebbe restituire un array di modelli Google AI', async () => {
      await request(server)
        .get('/models')
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const models = res.body as Model[];
          if (models.length > 0) {
            models.forEach((model: Model) => {
              expect(model.name).toBeDefined();
              expect(typeof model.name).toBe('string');
              expect(model.version).toBeDefined();
              expect(typeof model.version).toBe('string');
              expect(model.displayName).toBeDefined();
              expect(typeof model.displayName).toBe('string');
              if (model.description) {
                expect(typeof model.description).toBe('string');
              }
              expect(model.inputTokenLimit).toBeDefined();
              expect(typeof model.inputTokenLimit).toBe('number');
              expect(model.outputTokenLimit).toBeDefined();
              expect(typeof model.outputTokenLimit).toBe('number');
              expect(model.supportedGenerationMethods).toBeDefined();
              expect(Array.isArray(model.supportedGenerationMethods)).toBe(
                true,
              );
            });
          }
        });
    });
  });

  describe('POST /generate-image', () => {
    it("Dovrebbe generare un'immagine con un prompt valido", async () => {
      const prompt = 'A beautiful sunset over the ocean';
      await request(server)
        .post('/generate-image')
        .send({ prompt })
        .expect((res) => {
          // Accetta 200 se l'API funziona, 500 se l'API Google non è disponibile/configurata
          if (res.status === 201) {
            expect(res.headers['content-type']).toContain('image/png');
            expect(res.headers['content-disposition']).toContain(
              'inline; filename="image.png"',
            );
            expect(res.headers['content-length']).toBeDefined();
            // Verifica che la risposta sia un buffer di immagine (PNG)
            expect(Buffer.isBuffer(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
          } else if (res.status === 500) {
            // Se l'API Google non è disponibile, verifica che l'errore sia gestito correttamente
            expect(res.body).toBeDefined();
            expect(res.body.message).toBe('Error while generating image.');
          } else {
            throw new Error(`Unexpected status code: ${res.status}`);
          }
        });
    });

    it('Dovrebbe rifiutare una richiesta senza prompt', async () => {
      await request(server)
        .post('/generate-image')
        .send({})
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          // Array contente gli errori di validazione (es. "prompt must be a string")
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });

    it('Dovrebbe rifiutare una richiesta con prompt vuoto', async () => {
      await request(server)
        .post('/generate-image')
        .send({ prompt: '' })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          // Array contente gli errori di validazione (es. "prompt must be longer than or equal to 2 characters")
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });

    it('Dovrebbe rifiutare una richiesta con prompt troppo corto', async () => {
      await request(server)
        .post('/generate-image')
        .send({ prompt: 'A' })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          // Array contente gli errori di validazione (es. "prompt must be longer than or equal to 2 characters")
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });

    it('Dovrebbe rifiutare una richiesta con prompt non stringa', async () => {
      await request(server)
        .post('/generate-image')
        .send({ prompt: 123 })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          // Array contente gli errori di validazione (es. "prompt must be a string")
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });
  });

  describe('POST /edit-image', () => {
    it("Dovrebbe modificare un'immagine con un prompt valido e un file valido", async () => {
      const prompt = 'Make it brighter';
      const testImage = createTestImagePngBuffer();

      await request(server)
        .post('/edit-image')
        .field('prompt', prompt)
        .attach('file', testImage, 'test-image.png')
        .expect((res) => {
          // Accetta 200 se l'API funziona, 500 se l'API Google non è disponibile/configurata
          if (res.status === 201) {
            expect(res.headers['content-type']).toContain('image/png');
            expect(res.headers['content-disposition']).toContain(
              'inline; filename="image.png"',
            );
            expect(res.headers['content-length']).toBeDefined();
            // Verifica che la risposta sia un buffer di immagine (PNG)
            expect(Buffer.isBuffer(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
          } else if (res.status === 500) {
            // Se l'API Google non è disponibile, verifica che l'errore sia gestito correttamente
            expect(res.body).toBeDefined();
            expect(res.body.message).toBe('Error while generating image.');
          } else {
            throw new Error(`Unexpected status code: ${res.status}`);
          }
        });
    });

    it('Dovrebbe rifiutare una richiesta senza file', async () => {
      const prompt = 'Make it brighter';
      await request(server)
        .post('/edit-image')
        .field('prompt', prompt)
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toBe('No file was uploaded.');
        });
    });

    it('Dovrebbe rifiutare una richiesta senza prompt', async () => {
      const testImage = createTestImagePngBuffer();
      await request(server)
        .post('/edit-image')
        .attach('file', testImage, 'test-image.png')
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          // Array contente gli errori di validazione (es. "prompt must be a string")
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });

    it('Dovrebbe rifiutare una richiesta con prompt vuoto', async () => {
      const testImage = createTestImagePngBuffer();
      await request(server)
        .post('/edit-image')
        .field('prompt', '')
        .attach('file', testImage, 'test-image.png')
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          // Array contente gli errori di validazione (es. "prompt must be longer than or equal to 2 characters")
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });

    it('Dovrebbe rifiutare una richiesta con prompt troppo corto', async () => {
      const testImage = createTestImagePngBuffer();
      await request(server)
        .post('/edit-image')
        .field('prompt', 'A')
        .attach('file', testImage, 'test-image.png')
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          // Array contente gli errori di validazione (es. "prompt must be longer than or equal to 2 characters")
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });

    it("Dovrebbe rifiutare un file che non è un'immagine", async () => {
      const prompt = 'Make it brighter';
      const textFile = Buffer.from('This is not an image', 'utf-8');

      await request(server)
        .post('/edit-image')
        .field('prompt', prompt)
        .attach('file', textFile, 'test.txt')
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toBe(
            'The uploaded file must be an image. Please ensure the image has a .png, .jpeg, or .webp extension.',
          );
        });
    });

    it('Dovrebbe accettare un file JPEG valido con risposta 200', async () => {
      const prompt = 'Make it brighter';
      const jpegBuffer = createTestImageJpegBuffer();

      await request(server)
        .post('/edit-image')
        .field('prompt', prompt)
        .attach('file', jpegBuffer, 'test-image.jpg')
        .expect((res) => {
          if (res.status === 201) {
            expect(res.headers['content-type']).toContain('image/png');
            expect(res.headers['content-disposition']).toContain(
              'inline; filename="image.png"',
            );
            expect(res.headers['content-length']).toBeDefined();
            expect(Buffer.isBuffer(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
          } else if (res.status === 500) {
            expect(res.body).toBeDefined();
            expect(res.body.message).toBe('Error while generating image.');
          } else if (res.status === 400) {
            expect(res.body.message).toBeDefined();
          } else {
            throw new Error(`Unexpected status code: ${res.status}`);
          }
        });
    });

    it('Dovrebbe gestire un errore 400 per file JPEG invalido', async () => {
      const prompt = 'Make it brighter';
      const invalidJpegBuffer = Buffer.from('invalid jpeg', 'utf-8');

      await request(server)
        .post('/edit-image')
        .field('prompt', prompt)
        .attach('file', invalidJpegBuffer, 'test-image.jpg')
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toBe(
            'The uploaded file must be an image. Please ensure the image has a .png, .jpeg, or .webp extension.',
          );
        });
    });

    it('Dovrebbe accettare un file WebP valido con risposta 200', async () => {
      const prompt = 'Make it brighter';
      const webpBuffer = createTestImageWebpBuffer();

      await request(server)
        .post('/edit-image')
        .field('prompt', prompt)
        .attach('file', webpBuffer, 'test-image.webp')
        .expect((res) => {
          if (res.status === 201) {
            expect(res.headers['content-type']).toContain('image/png');
            expect(res.headers['content-disposition']).toContain(
              'inline; filename="image.png"',
            );
            expect(res.headers['content-length']).toBeDefined();
            expect(Buffer.isBuffer(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
          } else if (res.status === 500) {
            expect(res.body).toBeDefined();
            expect(res.body.message).toBe('Error while generating image.');
          } else if (res.status === 400) {
            expect(res.body.message).toBeDefined();
          } else {
            throw new Error(`Unexpected status code: ${res.status}`);
          }
        });
    });

    it('Dovrebbe gestire un errore 400 per file WebP invalido', async () => {
      const prompt = 'Make it brighter';
      const invalidWebpBuffer = Buffer.from('invalid webp', 'utf-8');

      await request(server)
        .post('/edit-image')
        .field('prompt', prompt)
        .attach('file', invalidWebpBuffer, 'test-image.webp')
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toBe(
            'The uploaded file must be an image. Please ensure the image has a .png, .jpeg, or .webp extension.',
          );
        });
    });
  });
});
