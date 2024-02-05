import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from './openai/openai.module';
import { OpenAIController } from './openai/openai.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'config/.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      // host: "0.0.0.0",
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ["dist/**/**.entity{.ts,.js}"],
      bigNumberStrings: false,
      logging: true,
      synchronize: true,  // on production have to be false!!!
    }),
    FileModule,
    OpenAIModule,
  ],
  controllers: [
    AppController,
    OpenAIController,
  ],
  providers: [AppService],
})
export class AppModule { }
