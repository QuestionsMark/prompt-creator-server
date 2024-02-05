import { IsString } from "class-validator";

export class CreateFileDto {
    @IsString()
    prompt: string;
}