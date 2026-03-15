export class InvalidBymlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotBymlError';
  }
}