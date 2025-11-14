# Google Gemini Generate Image API

API REST sviluppata con NestJS per la generazione e modifica di immagini utilizzando Google Gemini AI.

## 📋 Descrizione

Questo progetto fornisce un'interfaccia API per interagire con Google Gemini AI per:

- **Generare immagini** da prompt testuali
- **Modificare immagini** esistenti tramite prompt testuali
- **Ottenere la lista** dei modelli Google AI disponibili

L'API gestisce automaticamente la validazione e conversione dei file immagine, supportando i formati PNG, JPEG e WebP.

## 🚀 Funzionalità

### Endpoint Disponibili

#### 1. Genera Immagine

**POST** `/generate-image`

Genera un'immagine da un prompt testuale.

**Body (JSON):**

```json
{
  "prompt": "Un gatto che gioca in giardino"
}
```

**Risposta:** Immagine PNG in formato stream

#### 2. Modifica Immagine

**POST** `/edit-image`

Modifica un'immagine esistente utilizzando un prompt testuale.

**Body (multipart/form-data):**

- `prompt` (string): Il prompt testuale per la modifica
- `file` (file): L'immagine da modificare (PNG, JPEG, WebP)

**Risposta:** Immagine PNG modificata in formato stream

**Esempio con cURL:**

```bash
curl -X POST http://localhost:3000/edit-image \
  -F "prompt=Aggiungi un gatto sul tavolo" \
  -F "file=@/path/to/image.jpg"
```

#### 3. Lista Modelli

**GET** `/models`

Restituisce la lista di tutti i modelli Google AI disponibili.

**Risposta (JSON):**

```json
[
  {
    "name": "gemini-1.5-pro",
    "version": "001",
    "displayName": "Gemini 1.5 Pro",
    "description": "...",
    "inputTokenLimit": 2097152,
    "outputTokenLimit": 8192,
    "supportedGenerationMethods": ["generateContent"]
  }
]
```

## 🛠️ Tecnologie Utilizzate

- **NestJS** - Framework Node.js per applicazioni server-side
- **Google Gemini AI** (`@google/genai`) - SDK per l'integrazione con Google AI
- **TypeScript** - Linguaggio di programmazione
- **Sharp** - Libreria per la manipolazione delle immagini
- **Multer** - Middleware per l'upload di file
- **Class Validator** - Validazione dei DTO
- **Axios** - Client HTTP

## 📦 Prerequisiti

- Node.js 22 o superiore
- npm o yarn
- API Key di Google AI (ottienila da [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🔧 Installazione

1. **Clona il repository:**

```bash
git clone https://github.com/miketester10/google-gemini-generate-image-api.git
cd google-gemini-generate-image-api
```

2. **Installa le dipendenze:**

```bash
npm install
```

3. **Crea il file `.env` nella root del progetto:**

```env
GOOGLE_AI_API_KEY=your_api_key_here
GOOGLE_AI_MODELS_API=https://generativelanguage.googleapis.com/v1beta/models?key=
MODEL=gemini-2.0-flash-exp-image-generation
```

4. **Avvia l'applicazione in modalità sviluppo:**

```bash
npm run start:dev
```

L'API sarà disponibile su `http://localhost:3000`

## 🐳 Docker

### Build e avvio con Docker Compose

1. **Assicurati di avere il file `.env` configurato**

2. **Avvia il container:**

```bash
docker compose up --build
```

### Build manuale con Docker

1. **Costruisci l'immagine:**

```bash
docker build -t google-gemini-api .
```

2. **Esegui il container:**

```bash
docker run -p 3000:3000 --env-file .env google-gemini-api
```

## 📝 Script Disponibili

- `npm run build` - Compila il progetto TypeScript
- `npm run start` - Avvia l'applicazione in produzione
- `npm run start:dev` - Avvia l'applicazione in modalità sviluppo con hot-reload
- `npm run start:debug` - Avvia l'applicazione in modalità debug
- `npm run start:prod` - Avvia l'applicazione compilata
- `npm run lint` - Esegue il linter e corregge automaticamente gli errori
- `npm run format` - Formatta il codice con Prettier
- `npm run test` - Esegue i test unitari
- `npm run test:watch` - Esegue i test in modalità watch
- `npm run test:cov` - Esegue i test con report di coverage
- `npm run test:e2e` - Esegue i test end-to-end

## 🔍 Validazione File

Il progetto include un sistema di validazione automatica dei file caricati:

- **Verifica del tipo MIME** tramite magic number (più sicuro del controllo dell'estensione)
- **Conversione automatica** in PNG per formati non supportati direttamente da Gemini
- **Supporto formati:** PNG, JPEG, WebP
- **Gestione file grandi:** File superiori a 20MB vengono caricati su Google AI prima dell'elaborazione

## 📁 Struttura del Progetto

```
google-gemini-generate-image-api/
├── src/
│   ├── app.controller.ts          # Controller principale con gli endpoint
│   ├── app.service.ts             # Logica di business per Gemini AI
│   ├── app.module.ts              # Modulo principale NestJS
│   ├── main.ts                    # Entry point dell'applicazione
│   ├── common/
│   │   └── pipes/
│   │       └── file-validation.pipe.ts  # Validazione e conversione file
│   ├── dto/
│   │   └── base-prompt.dto.ts     # DTO per la validazione del prompt
│   └── interfaces/
│       └── google-ai-models-response.interface.ts  # Interfacce TypeScript
├── test/
│   └── app.e2e-spec.ts            # Test end-to-end
├── Dockerfile                     # Configurazione Docker
├── docker-compose.yml             # Configurazione Docker Compose
└── package.json                   # Dipendenze e script
```

## 🔐 Variabili d'Ambiente

| Variabile              | Descrizione                                    | Obbligatoria |
| ---------------------- | ---------------------------------------------- | ------------ |
| `GOOGLE_AI_API_KEY`    | Chiave API di Google AI                        | Sì           |
| `GOOGLE_AI_MODELS_API` | URL base per l'API dei modelli                 | Sì           |
| `MODEL`                | Nome del modello Gemini da utilizzare          | Sì           |
|

## 🧪 Testing

Esegui i test end-to-end:

```bash
npm run test:e2e
```

Esegui i test unitari con coverage:

```bash
npm run test:cov
```

## ⚠️ Limitazioni

- **Formati supportati:** Solo PNG, JPEG e WebP
- **Dimensione massima file:** Non ci sono limiti hardcoded, ma file > 20MB vengono gestiti diversamente
- **Formato output:** Le immagini generate vengono sempre restituite in formato PNG

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request


## 👤 Autore

Progetto sviluppato per l'integrazione con Google Gemini AI.

## 🔗 Link Utili

- [Documentazione NestJS](https://docs.nestjs.com/)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
