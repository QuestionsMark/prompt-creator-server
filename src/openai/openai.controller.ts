import { Body, Controller, Get, Headers, HttpCode, Post, Query } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { GeneratePromptDto } from "./dto/generate-prompt.dto";
import { RefillPromptDto } from "./dto/refill-prompt.dto";
import { GenerateImageDto } from "./dto/generate-image.dto";

@Controller('openai')
export class OpenAIController {
    constructor(private readonly openAIService: OpenAIService) { }

    @Post('/prompt')
    @HttpCode(201)
    generatePrompt(
        @Body() dto: GeneratePromptDto,
        @Headers('x-api-key') apiKey: string,
    ) {
        return this.openAIService.generateGenericPrompt(apiKey, dto.prompt);
    }

    @Post('/prompt/refill')
    @HttpCode(201)
    refillPrompt(
        @Body() dto: RefillPromptDto,
        @Headers('x-api-key') apiKey: string,
    ) {
        return this.openAIService.refillVariables(apiKey, dto.prompt);
    }

    @Post('/prompt/description')
    @HttpCode(201)
    generateDescription(
        @Body() dto: RefillPromptDto,
        @Headers('x-api-key') apiKey: string,
    ) {
        return this.openAIService.generateDescription(apiKey, dto.prompt);
    }

    @Post('/prompt/variables-examples')
    @HttpCode(201)
    generateVariablesExamples(
        @Body() dto: RefillPromptDto,
        @Headers('x-api-key') apiKey: string,
    ) {
        return this.openAIService.generateVariablesExamples(apiKey, dto.prompt);
    }

    @Post('/image')
    @HttpCode(201)
    generateImage(
        @Body() dto: GenerateImageDto,
        @Headers('x-api-key') apiKey: string,
    ) {
        return this.openAIService.generateImage(apiKey, dto.prompt);
    }

    @Get('/prompts')
    getImages(
        @Query('limit') limit: number,
        @Query('page') page: number,
    ) {
        return this.openAIService.getPrompts(page, limit);
    }
}