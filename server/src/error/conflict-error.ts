export class ConflictError extends Error {
  constructor(message, private field = undefined) {
    super(message);
  }
}
