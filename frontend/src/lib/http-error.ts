const REQUEST_ID_HEADER = "X-Request-ID";

export async function responseError(
  response: Response,
  fallbackMessage: string,
): Promise<Error> {
  const body = await response.json().catch(() => null);
  const detail = body?.detail ?? fallbackMessage;
  const message = typeof detail === "string" ? detail : JSON.stringify(detail);
  return new Error(withRequestId(message, response));
}

export function statusError(response: Response, message: string): Error {
  return new Error(withRequestId(message, response));
}

function withRequestId(message: string, response: Response): string {
  const requestId = response.headers.get(REQUEST_ID_HEADER);
  return requestId ? `${message} request_id=${requestId}` : message;
}
