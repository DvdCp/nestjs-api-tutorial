import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import * as pactum from 'pactum';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
        await app.listen(3333);
        pactum.request.setBaseUrl('http://localhost:3333');

        prisma = app.get(PrismaService);
        await prisma.cleanDb();
    });

    describe('Auth test', () => {
        const requestBody: AuthDto = {
            email: 'davidc@gmail.com',
            password: 'Bye',
        };
        describe('Signup', () => {
            it('Signup is successful', () => {
                const expectedStatus = 201;
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody(requestBody)
                    .expectStatus(expectedStatus);
            });
            it('Signup is not successful and an error is thrown (empty username) ', () => {
                const expectedStatus = 400;
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({
                        password: requestBody.password,
                    })
                    .expectStatus(expectedStatus);
            });
            it('Signup is not successful and an error is thrown (empty email) ', () => {
                const expectedStatus = 400;
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({
                        password: requestBody.email,
                    })
                    .expectStatus(expectedStatus);
            });
            it('Signup is not successful and an error is thrown (empty body) ', () => {
                const expectedStatus = 400;
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({})
                    .expectStatus(expectedStatus);
            });
        });
        describe('Signin', () => {
            it('should signin successfully', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody(requestBody)
                    .expectStatus(200)
                    .stores('userAt', 'access_token');
            });
        });
    });

    describe('User test', () => {
        describe('Get current user (me)', () => {
            it('should get current user', () => {
                return pactum
                    .spec()
                    .get('/users/me')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200);
            });
        });

        describe('Edit user', () => {
            it('should edit current user', () => {
                const dto: EditUserDto = {
                    email: 'test@test.com',
                    lastName: 'test',
                };
                return pactum
                    .spec()
                    .patch('/users')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.email)
                    .expectBodyContains(dto.lastName);
            });
        });
    });

    describe('Bookmark test', () => {
        describe('Get empty bookmark list', () => {
            it('should return empty bookmark list', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200)
                    .expectBody([]);
            });
        });
        describe('Create bookmark by id', () => {
            it('should create a bookmark with a name and a link', () => {
                const dto: CreateBookmarkDto = {
                    title: 'My first bookmark',
                    link: 'https://www.youtube.com/watch?v=ntk8ZABq7IY',
                };

                return pactum
                    .spec()
                    .post('/bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(201)
                    .stores('bookmarkId', 'id');
            });
        });
        describe('Get bookmark list', () => {
            it('should return bookmark list', () => {
                return pactum
                    .spec()
                    .get('/bookmarks/')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200)
                    .expect((ctx) => {
                        expect(ctx.res.body.length).toBeGreaterThan(0);
                    });
            });
        });
        describe('Get bookmark by id', () => {
            it('should return bookmark identified by given id', () => {
                return pactum
                    .spec()
                    .get('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200)
                    .expectBodyContains('$S{bookmarkId}');
            });
        });
        describe('Edit bookmark by id', () => {});
        describe('Delete bookmark by id', () => {});
    });

    afterAll(async () => {
        app.close();
    });
});
