import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
 INestApplication,
 ValidationPipe,
} from '@nestjs/common';

import * as pactum from 'pactum';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import e from 'express';

describe('App e2e', () => {
 let app: INestApplication;
 let prisma: PrismaService;

 beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
   imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(
   new ValidationPipe({ whitelist: true }),
  );
  await app.init();
  await app.listen(3333);

  prisma = app.get(PrismaService);
  await prisma.cleanDb();
 });

 describe('Auth test', () => {
  describe('Signup', () => {
   it('Signup is successful', () => {
    const requestBody: AuthDto = {
     email: 'davidc@gmail.com',
     password: 'Bye',
    };
    const expectedStatus = 201;
    return pactum
     .spec()
     .post('http://localhost:3333/auth/signup')
     .withBody(requestBody)
     .expectStatus(expectedStatus);
   });
  });
  describe('Signin', () => {});
 });

 describe('User test', () => {
  describe('Get current user (me)', () => {});
  describe('Get current user (me)', () => {});
 });

 describe('Bookmark test', () => {
  describe('Create bookmark', () => {});
  describe('Get bookmarks', () => {});
  describe('Get bookmark by id', () => {});
  describe('Edit bookmark', () => {});
  describe('Delete bookmark', () => {});
 });

 it.todo('should pass');

 afterAll(async () => {
  app.close();
 });
});
