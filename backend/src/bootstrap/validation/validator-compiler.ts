import type {
  FastifyError,
  FastifyInstance,
  FastifySchema,
  FastifySchemaValidationError,
} from 'fastify';
import { ZodError, type ZodTypeAny } from 'zod';

function isZodSchema(schema: unknown): schema is ZodTypeAny {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    'safeParse' in schema &&
    typeof schema.safeParse === 'function'
  );
}

function formatZodIssues(error: ZodError): FastifySchemaValidationError[] {
  return error.issues.map((issue) => ({
    keyword: 'invalid',
    instancePath: issue.path.length > 0 ? `/${issue.path.join('/')}` : '',
    schemaPath: '',
    message: issue.message,
    params: {
      path: issue.path.join('.'),
    },
  }));
}

export function validatorCompiler({ schema }: { schema: FastifySchema }) {
  if (!isZodSchema(schema)) {
    return (data: unknown) => ({ value: data });
  }

  return (data: unknown) => {
    const result = schema.safeParse(data);

    if (!result.success) {
      return { error: formatZodIssues(result.error) };
    }

    return { value: result.data };
  };
}

export function registerGlobalValidation(app: FastifyInstance) {
  app.setValidatorCompiler(validatorCompiler);

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: error.validation,
      });
      return;
    }

    request.log.error(error);
    reply.status(error.statusCode ?? 500).send({
      statusCode: error.statusCode ?? 500,
      error: error.name ?? 'Internal Server Error',
      message: error.message,
    });
  });
}
