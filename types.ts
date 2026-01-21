export interface GeneratedPrompt {
  prompt: string;
  originalImage: string; // Base64
}

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  aspectRatio: string;
}

export enum AspectRatio {
  Square = "1:1",
  Portrait = "3:4",
  Landscape = "4:3",
  Mobile = "9:16",
  Wide = "16:9"
}

export enum ImageSize {
  OneK = "1K",
  TwoK = "2K",
  FourK = "4K"
}

// Global declaration for window.aistudio
declare global {
  // Augment the existing AIStudio interface which is already defined in the environment.
  // This avoids the conflict error: "Subsequent property declarations must have the same type".
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}