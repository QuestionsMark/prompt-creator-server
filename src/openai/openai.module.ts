import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { OpenAIController } from "./openai.controller";
import { ResponseModule } from "src/common/response/response.module";
import { FileModule } from "src/file/file.module";

@Module({
    controllers: [OpenAIController],
    exports: [
        OpenAIService,
    ],
    imports: [
        ResponseModule,
        FileModule,
    ],
    providers: [
        OpenAIService,
    ],
})
export class OpenAIModule { }