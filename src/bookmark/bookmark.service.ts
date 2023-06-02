import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

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

    async editBookmarkById(
        userId: number,
        bookmarkId: number,
        dto: EditBookmarkDto,
    ) {
        const bookmark = this.getBookmarkById(userId, bookmarkId);

        if (!bookmark)
            throw new NotFoundException('Bookmark not found for this user');

        return this.prisma.bookmark.update({
            where: {
                id: bookmarkId,
            },
            data: {
                ...dto,
            },
        });
    }

    async deleteBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = this.getBookmarkById(userId, bookmarkId);

        if (!bookmark)
            throw new NotFoundException('Bookmark not found for this user');

        await this.prisma.bookmark.delete({
            where: {
                id: bookmarkId,
            },
        });
    }
}
