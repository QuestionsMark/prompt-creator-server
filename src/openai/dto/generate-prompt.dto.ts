import { IsString } from "class-validator";

export class GeneratePromptDto {
    @IsString()
    prompt: string;
}