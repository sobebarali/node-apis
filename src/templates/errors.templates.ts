/**
 * The shared errors file: error types and the refusal helper every module uses.
 * It is written once, where `handlers.errorsFile` points, and never overwritten.
 */

/** The shared type each default error code of a new type file is written as */
export const SHARED_ERROR_TYPES: Record<string, string> = {
  VALIDATION_ERROR: 'typeValidationError',
  NOT_FOUND: 'typeNotFound',
  DUPLICATE_ENTRY: 'typeDuplicateEntry',
  INTERNAL_ERROR: 'typeInternalError',
};

export const generateErrorsFileContent = (): string => `/**
 * Error types and the refusal helper every module shares.
 * node-apis wrote this file once and never overwrites it: edit it freely.
 */

/** The shape of every returned error. \`data\` holds what the caller needs to explain it. */
export type typeError<Code extends string, StatusCode extends number, Data = undefined> = {
  code: Code;
  message: string;
  statusCode: StatusCode;
  data?: Data;
};

export type typeValidationError = typeError<'VALIDATION_ERROR', 400> & { field?: string };

export type typeBadRequest<Code extends string = 'BAD_REQUEST', Data = undefined> = typeError<
  Code,
  400,
  Data
>;

export type typeForbidden<Code extends string = 'FORBIDDEN', Data = undefined> = typeError<
  Code,
  403,
  Data
>;

export type typeNotFound<Code extends string = 'NOT_FOUND', Data = undefined> = typeError<
  Code,
  404,
  Data
>;

export type typeConflict<Code extends string = 'CONFLICT', Data = undefined> = typeError<
  Code,
  409,
  Data
>;

export type typeDuplicateEntry = typeError<'DUPLICATE_ENTRY', 409>;

export type typeUnprocessable<Code extends string = 'UNPROCESSABLE', Data = undefined> = typeError<
  Code,
  422,
  Data
>;

export type typeInternalError = typeError<'INTERNAL_ERROR', 500>;

/**
 * Thrown to refuse a request from anywhere below a handler, also inside a
 * transaction: the transaction rolls back and the handler returns \`error\`.
 *
 *   throw new Refusal({ code: 'NOT_FOUND', message: 'Post not found', statusCode: 404 });
 */
export class Refusal extends Error {
  readonly error: typeError<string, number, unknown>;

  constructor(error: typeError<string, number, unknown>) {
    super(error.message);
    this.name = 'Refusal';
    this.error = error;
  }
}

/**
 * Runs \`work\` and returns a thrown Refusal as \`error\`. Generated handlers do
 * this themselves; use it in code that is not one. Any other error is thrown again.
 */
export const refusable = async <Data, RefusalError>(
  work: () => Promise<Data>
): Promise<{ data: Data; error: null } | { data: null; error: RefusalError }> => {
  try {
    return { data: await work(), error: null };
  } catch (error) {
    if (error instanceof Refusal) {
      return { data: null, error: error.error as RefusalError };
    }

    throw error;
  }
};
`;
