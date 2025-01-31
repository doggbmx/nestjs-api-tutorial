import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prismaService: PrismaService) {}

    getBookmarks(userId: number) {
        return this.prismaService.bookmark.findMany({
            where: { userId }
        });
    }

    getBookmarkById(id: number, userId: number) {
        return this.prismaService.bookmark.findFirst({
            where: { id, userId }
        });
    }

    createBookmark(userId: number, dto: CreateBookmarkDto) {
        return this.prismaService.bookmark.create({
            data: { ...dto, userId }
        })
    }

    async editBookmark(bookmarkId: number, userId: number, dto: EditBookmarkDto) {
        const bookmark = await this.prismaService.bookmark.findFirst({
            where: { id: bookmarkId, userId }
        })

        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException('You are not allowed to edit this bookmark');
        }

        return await this.prismaService.bookmark.update({
            where: { id: bookmarkId },
            data: dto
        });
    }

    deleteBookmark(userId: number, bookmarkId: number) {
        return this.prismaService.bookmark.delete({
            where: { id: bookmarkId },
        });
    }
}
