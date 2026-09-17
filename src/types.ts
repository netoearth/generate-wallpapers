export type AspectRatio = '9:16' | '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '16:9' | '21:9';

export type ImageSize = '1K' | '2K' | '4K';

export type ModelChoice =
  | 'flux-dev-free'
  | 'gemini-3-pro-image-preview'
  | 'gemini-3.1-flash-image-preview'
  | 'custom-api';

export type CustomApiProvider =
  | 'qwen-dashscope'
  | 'siliconflow'
  | 'deepseek-compat'
  | 'zhipu-cogview'
  | 'custom-openai';

export interface CustomApiConfig {
  enabled: boolean;
  provider: CustomApiProvider;
  endpoint: string;
  apiKey: string;
  model: string;
  enablePromptEnhance?: boolean;
  enhancerModel?: string;
  enhancerEndpoint?: string;
  enhancerApiKey?: string;
}

export type Language = 'zh' | 'en';

export interface Wallpaper {
  id: string;
  url: string;
  prompt: string;
  variationIndex: number;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  model: string;
  createdAt: number;
  isRemix: boolean;
  referenceThumbnail?: string;
}

export interface WallpaperBatch {
  id: string;
  prompt: string;
  wallpapers: Wallpaper[];
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  model: string;
  timestamp: number;
  isRemix: boolean;
  referenceImage?: string;
}

export interface GenerationRequest {
  prompt: string;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  model?: ModelChoice;
  referenceImage?: string | null;
  count?: number;
  customApi?: CustomApiConfig;
}

export interface GenerationResponse {
  success: boolean;
  wallpapers?: Wallpaper[];
  error?: string;
}
