import { IsString } from "class-validator";

export class RefillPromptDto {
    @IsString()
    prompt: string;
}