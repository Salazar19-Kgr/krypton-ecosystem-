export type KryptonRuntimeConfig = {
  environment: string;
  geminiConfigured: boolean;
  groqConfigured: boolean;
  openRouterConfigured: boolean;
  tavilyConfigured: boolean;
  cloudinaryConfigured: boolean;
};

export function getKryptonRuntimeConfig(): KryptonRuntimeConfig {
  return {
    environment:
      process.env.KRYPTON_ENVIRONMENT ?? "development",

    geminiConfigured:
      Boolean(process.env.GEMINI_API_KEY),

    groqConfigured:
      Boolean(process.env.GROQ_API_KEY),

    openRouterConfigured:
      Boolean(process.env.OPENROUTER_API_KEY),

    tavilyConfigured:
      Boolean(process.env.TAVILY_API_KEY),

    cloudinaryConfigured:
      Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
      Boolean(process.env.CLOUDINARY_API_KEY) &&
      Boolean(process.env.CLOUDINARY_API_SECRET),
  };
}
