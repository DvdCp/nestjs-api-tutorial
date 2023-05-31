import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) {}
    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto,
            },
        });

        return bookmark;
    }

    async getBookmarks(userId: number) {
        const bookmarks = await this.prisma.bookmark.findMany({
            where: {
                userId,
            },
        });

        return bookmarks;
    }

    async getBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
                userId,
            },
        });

        return bookmark;
    }

    editBookmarkById() {}

    deleteBookmarkById() {}
}
