export type AIErrorCode =
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_REQUEST"
  | "AUTHENTICATION_FAILED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "UNKNOWN";

export class AIProviderError extends Error {
  code: AIErrorCode;
  provider: string;
  retryable: boolean;

  constructor(
    provider: string,
    code: AIErrorCode,
    message: string,
    retryable = false,
  ) {
    super(message);
    this.name = "AIProviderError";
    this.provider = provider;
    this.code = code;
    this.retryable = retryable;
  }
}
