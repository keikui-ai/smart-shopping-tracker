// This is a type declaration file to make TypeScript aware of the '@google/genai'
// module that is being loaded via an import map in the browser.
// This prevents build errors when `tsc` can't find the module in node_modules.

declare module '@google/genai' {
  export enum Type {
    OBJECT = 'OBJECT',
    ARRAY = 'ARRAY',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    // Add other types if needed by the application
  }

  export interface GroundingChunk {
    web?: {
      uri: string;
      title: string;
    };
    // Add other grounding sources if needed
  }

  export interface GroundingMetadata {
    groundingChunks: GroundingChunk[];
  }

  export interface Candidate {
    groundingMetadata?: GroundingMetadata;
    // Add other candidate properties if needed
  }

  export interface GenerateContentResponse {
    text: string;
    candidates?: Candidate[];
  }

  export interface GenerateContentRequest {
    model: string;
    contents: any;
    config?: {
      tools?: any[];
      responseMimeType?: string;
      responseSchema?: any;
    };
  }
  
  export class GoogleGenAI {
    constructor(config: { apiKey: string | undefined });
    models: {
      generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse>;
    };
  }
}
