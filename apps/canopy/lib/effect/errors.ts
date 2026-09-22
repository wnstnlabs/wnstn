import { Data } from 'effect';

export class ValidationError extends Data.TaggedError('ValidationError')<{ message: string; field?: string }> {}
export class NotFoundError extends Data.TaggedError('NotFoundError')<{ message: string }> {}
export class DatabaseError extends Data.TaggedError('DatabaseError')<{ cause: unknown }> {}
export class DomainError extends Data.TaggedError('DomainError')<{ message: string }> {}
