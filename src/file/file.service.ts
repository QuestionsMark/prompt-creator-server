import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { Image, Openai, ServerErrorResponse, ServerSuccessfullResponse } from 'src/types';
import { v4 as uuid } from "uuid";
import { writeFile } from 'fs/promises';
import { FileItem } from './entities/file-item.entity';
import { ResponseService } from 'src/common/response/response.service';

@Injectable()
export class FileService {
    constructor(
        @Inject(ResponseService) private responseService: ResponseService,
    ) { }
    sendSuccessfullResponse<T>(results: T, count?: number): ServerSuccessfullResponse<T> {
        return { results, count };
    }

    sendErrorResponse(message: string, problems?: string[]): ServerErrorResponse {
        if (problems) return { message, problems }
        return { message };
    }

    async getFile(id: string, res: Response) {
        try {
            const file = await FileItem.findOne({
                where: {
                    id,
                }
            });
            if (!file) {
                throw new NotFoundException('No file found!');
            }

            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.sendFile(file.filename, {
                root: 'storage',
            });
        } catch (e) {
            res.status(500).json(this.responseService.sendErrorResponse('Something went wrong, try again later.'));
        }
    }

    async saveFile(base64: string): Promise<string> {
        const filename = `${uuid()}.png`;
        await writeFile(`storage/${filename}`, base64, 'base64');

        return filename;
    }

    async getImages(page: number, limit: number): Promise<ServerSuccessfullResponse<Image[]>> {
        const [images, count] = await FileItem.findAndCount({
            skip: this.responseService.skip(page, limit),
            take: this.responseService.limit(limit),
            order: {
                createdAt: "DESC",
            },
            select: ['createdAt', 'id'],
        });

        return this.responseService.sendSuccessfullResponse(images, count);
    }
}
