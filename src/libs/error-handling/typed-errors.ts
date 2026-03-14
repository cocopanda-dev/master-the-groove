export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly recoverable: boolean = true,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AudioError extends AppError {
  constructor(message: string) {
    super(message, 'AUDIO_ERROR', true);
    this.name = 'AudioError';
  }
}

export class SyncError extends AppError {
  constructor(message: string) {
    super(message, 'SYNC_ERROR', true);
    this.name = 'SyncError';
  }
}
