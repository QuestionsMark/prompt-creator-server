export namespace Openai {
    export interface ChatResponse {
        content: null | string;
    }

    export interface CreatePromptResponse {
        descriptivePrompt: string;
        genericPrompt: string;
        examplePrompt: string;
        originalPrompt: string;
        id: string;
        createdAt: Date;
    }

    export interface VariableExample {
        variableName: string;
        examples: string[];
    }
}