import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { FileService } from './file.service';
import { Response } from 'express';

@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Get('/images')
    getImages(
        @Query('limit') limit: number,
        @Query('page') page: number,
    ) {
        return this.fileService.getImages(page, limit);
    }

    @Get('/:id')
    getFile(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        return this.fileService.getFile(id, res);
    }

}
