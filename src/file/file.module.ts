import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ResponseModule } from 'src/common/response/response.module';

@Module({
  controllers: [FileController],
  exports: [FileService],
  imports: [ResponseModule],
  providers: [FileService],
})
export class FileModule { }
