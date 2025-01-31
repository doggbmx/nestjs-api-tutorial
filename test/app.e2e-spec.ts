import {Test} from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe(
      { whitelist: true }
    ));
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    pactum.request.setBaseUrl('http://localhost:3000');

    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  });

  
  describe('Auth', () => {
    describe('signup', () => {
      it('should sign up a user', async () => {
        const dto: AuthDto = {
          email: 'asd@asd.com',
          password: 'secretpass'
        }
        return pactum.spec().post('/auth/sign-up')
        .withBody(dto)
        .expectStatus(201)
      });

      it('should throw an error if email empty', async () => {
        const dto: AuthDto = {
          email: 'asd@asd.com',
          password: 'secretpass'
        }
        return pactum.spec().post('/auth/sign-up')
        .withBody({
          password: dto.password
        })
        .expectStatus(400)
      });

      it('should throw an error if password empty', async () => {
        const dto: AuthDto = {
          email: 'asd@asd.com',
          password: 'secretpass'
        }
        return pactum.spec().post('/auth/sign-up')
        .withBody({
          email: dto.email
        })
        .expectStatus(400)
      });

      it('should throw an error if body empty', async () => {
        return pactum.spec().post('/auth/sign-up')
        .expectStatus(400)
      });
    });

    describe('login', () => {
      it('should log in a user', async () => {
        const dto: AuthDto = {
          email: 'asd@asd.com',
          password: 'secretpass'
        }
        return pactum.spec().post('/auth/login')
        .withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token');
      });

      it('should throw an error if email empty', async () => {
        const dto: AuthDto = {
          email: 'asd@asd.com',
          password: 'secretpass'
        }
        return pactum.spec().post('/auth/login')
        .withBody({
          password: dto.password
        })
        .expectStatus(400)
      });

      it('should throw an error if password empty', async () => {
        const dto: AuthDto = {
          email: 'asd@asd.com',
          password: 'secretpass'
        }
        return pactum.spec().post('/auth/login')
        .withBody({
          email: dto.email
        })
        .expectStatus(400)
      });

      it('should throw an error if body empty', async () => {
        const dto: AuthDto = {
          email: 'asd@asd.com',
          password: 'secretpass'
        }
        return pactum.spec().post('/auth/login')
        .expectStatus(400)
      });
    });
  })

  describe('Users', () => {
    describe('Get me', () => {
      it('should get the current user', async () => {
        return pactum.spec()
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .get('/users/me')
        .expectStatus(200);
        });
      });

    describe('Edit user', () => {
      it('should edit the current user', async () => {
        const dto: EditUserDto = {
          email: 'asd3@asd.com',
        }

        return pactum.spec()
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .patch('/users')
        .withBody(dto)
        .expectStatus(200);
        });
      });
    })

  describe('Bookmarks', () => {
    describe('Create bookmark', () => {
      it('should create a bookmark', async () => {
        const dto: CreateBookmarkDto = {
          link: 'https://google.com',
          title: 'Google',
          description: 'Search engine'
        }

        return pactum.spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id')
      })
    })

    describe('Get bookmarks', () => {
      it('should get bookmarks by userId', async () => {
        return pactum.spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectJsonLength(1)
      })
    })

    describe('Get empty bookmarks', () => {
      it('should get empty bookmarks', async () => {
        return pactum.spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectJsonLength(1)
      });
    })

    describe('Get bookmarks by Id', () => {
      it('should get a bookmark by Id', async () => {
        return pactum.spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
      })
    })

    describe('Edit bookmark by Id', () => {
      it('should edit a bookmark by Id', async () => {
        const dto: EditBookmarkDto = {
          title: 'Google sucks',
          description: 'Search engine',
        };

        return pactum.spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)



      });
    })

    describe('Delete bookmark', () => {
      it('should delete a bookmark', async () => {
        return pactum.spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })
  });
});