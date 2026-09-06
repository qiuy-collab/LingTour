import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';
import { CityCultureSection } from './entities/city-section.entity';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CitiesController } from './cities.controller';

describe('CitiesService', () => {
  let service: CitiesService;
  let cityRepo: jest.Mocked<Partial<Repository<City>>>;
  let sectionRepo: jest.Mocked<Partial<Repository<CityCultureSection>>>;
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: {
      create: jest.Mock;
      save: jest.Mock;
      update: jest.Mock;
      findOneOrFail: jest.Mock;
      delete: jest.Mock;
      query: jest.Mock;
      softDelete: jest.Mock;
    };
  };
  let dataSource: {
    createQueryRunner: jest.Mock;
  };

  const mockCity: City = {
    id: 'uuid-city',
    slug: 'zhanjiang',
    name: { en: 'Zhanjiang', zh: '湛江' },
    regionLabel: { en: 'Southern coast', zh: '南部海岸' },
    heroImage: 'https://example.com/hero.jpg',
    heroMedia: null,
    galleryMedia: [],
    relatedCitySlugs: [],
    contentMarkdown: '## Original\n\nEnglish content.',
    publishedAt: new Date('2025-01-01T00:00:00Z'),
    heroNarrative: { en: 'Narrative...', zh: '叙述...' },
    tags: [{ en: 'Coast', zh: '滨海' }],
    editorIntro: { en: '## Intro...', zh: '## 介绍...' },
    galleryImages: ['img1.jpg', 'img2.jpg'],
    foodTitle: { en: 'Flavours', zh: '风味' },
    foodDescription: { en: 'Desc...', zh: '描述...' },
    foodImages: ['food1.jpg'],
    published: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [],
  };

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        findOneOrFail: jest.fn(),
        delete: jest.fn().mockResolvedValue(undefined),
        query: jest.fn().mockResolvedValue([]),
        softDelete: jest.fn().mockResolvedValue(undefined),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    cityRepo = {
      findAndCount: jest.fn().mockResolvedValue([[mockCity], 1]),
      findOne: jest.fn().mockResolvedValue(mockCity),
      create: jest.fn().mockReturnValue(mockCity),
      save: jest.fn().mockResolvedValue(mockCity),
      softRemove: jest.fn().mockResolvedValue(mockCity),
      count: jest.fn().mockResolvedValue(1),
      manager: {
        query: jest.fn().mockResolvedValue([]),
      } as unknown as EntityManager,
    };

    sectionRepo = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        { provide: getRepositoryToken(City), useValue: cityRepo },
        {
          provide: getRepositoryToken(CityCultureSection),
          useValue: sectionRepo,
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  describe('findAllPublished', () => {
    it('should return paginated published cities', async () => {
      const result = await service.findAllPublished(1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(cityRepo.findAndCount).toHaveBeenCalled();
    });

    it('should apply pagination offset', async () => {
      await service.findAllPublished(2, 10);
      const callArgs = (cityRepo.findAndCount as jest.Mock).mock.calls[0][0];
      expect(callArgs.skip).toBe(10);
      expect(callArgs.take).toBe(10);
    });
  });

  describe('findBySlugPublished', () => {
    it('should return city with sorted sections', async () => {
      const cityWithSections = {
        ...mockCity,
        sections: [
          { sortOrder: 2, title: { en: 'C', zh: '三' } } as any,
          { sortOrder: 0, title: { en: 'A', zh: '一' } } as any,
          { sortOrder: 1, title: { en: 'B', zh: '二' } } as any,
        ],
      };
      cityRepo.findOne!.mockResolvedValue(cityWithSections as any);

      const result = await service.findBySlugPublished('zhanjiang');

      expect(result.sections[0].sortOrder).toBe(0);
      expect(result.sections[1].sortOrder).toBe(1);
      expect(result.sections[2].sortOrder).toBe(2);
    });

    it('should throw NotFoundException for unknown slug', async () => {
      cityRepo.findOne!.mockResolvedValue(null);

      await expect(service.findBySlugPublished('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should throw ConflictException on duplicate slug', async () => {
      cityRepo.findOne!.mockResolvedValue(mockCity as any);

      await expect(
        service.create({
          slug: 'zhanjiang',
          name: { en: 'Test', zh: '测试' },
          regionLabel: { en: 'Test', zh: '测试' },
          heroImage: 'test.jpg',
          heroNarrative: { en: 'Test', zh: '测试' },
          editorIntro: { en: 'Test', zh: '测试' },
          foodTitle: { en: 'Test', zh: '测试' },
          foodDescription: { en: 'Test', zh: '测试' },
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Markdown contract', () => {
    let stored: City;
    const markdown =
      '# Field notes\n\n**Unchanged** text.\n\n![Harbour](/uploads/harbour.jpg)\n\n> A quote.\n';

    beforeEach(() => {
      stored = structuredClone(mockCity);
      cityRepo.findOne!.mockImplementation(async (options) => {
        const where = options!.where as Partial<City>;
        if (where.published === true && !stored.published) return null;
        return structuredClone(stored);
      });
      queryRunner.manager.create.mockImplementation((_entity, values) => ({
        ...values,
        id: 'uuid-city',
        sections: [],
      }));
      queryRunner.manager.save.mockImplementation(async (value) => {
        stored = structuredClone(value);
        return value;
      });
      queryRunner.manager.update.mockImplementation(
        async (_entity, _id, values) => {
          Object.assign(stored, structuredClone(values));
        },
      );
      queryRunner.manager.findOneOrFail.mockImplementation(async () =>
        structuredClone(stored),
      );
      queryRunner.manager.query.mockImplementation(async (sql: string) => {
        if (sql.includes('COALESCE(published_at'))
          stored.publishedAt ??= new Date();
        return [];
      });
    });

    it('creates an empty draft without legacy content or a publication timestamp', async () => {
      cityRepo.findOne!.mockResolvedValueOnce(null);
      const result = await service.create({
        slug: 'new-city',
        name: { en: '' },
      });
      expect(result).toMatchObject({
        contentMarkdown: '',
        published: false,
        publishedAt: null,
        heroImage: '',
        name: { en: '', zh: '' },
        editorIntro: { en: '', zh: '' },
      });
    });

    it('creates a published article with exact Markdown and first publication time', async () => {
      cityRepo.findOne!.mockResolvedValueOnce(null);
      const result = await service.create({
        slug: 'new-city',
        name: { en: 'New City' },
        contentMarkdown: markdown,
        published: true,
      });
      expect(result.contentMarkdown).toBe(markdown);
      expect(result.publishedAt).toBeInstanceOf(Date);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('roundtrips Markdown through save, admin refresh and public detail without rewriting legacy data', async () => {
      const legacy = structuredClone(stored);
      const result = await service.update(stored.id, {
        contentMarkdown: markdown,
        name: { en: 'New English' },
      });
      expect(result.contentMarkdown).toBe(markdown);
      expect((await service.findByIdAdmin(stored.id)).contentMarkdown).toBe(
        markdown,
      );
      expect(
        (await service.findBySlugPublished(stored.slug)).contentMarkdown,
      ).toBe(markdown);
      expect(stored.name).toEqual({ en: 'New English', zh: legacy.name.zh });
      for (const key of [
        'editorIntro',
        'heroNarrative',
        'foodTitle',
        'foodDescription',
        'tags',
        'galleryImages',
        'heroMedia',
        'sections',
        'publishedAt',
      ] as const) {
        expect(stored[key]).toEqual(legacy[key]);
      }
      expect(queryRunner.manager.update).toHaveBeenCalledWith(City, stored.id, {
        contentMarkdown: markdown,
        name: { en: 'New English', zh: legacy.name.zh },
      });
      expect(queryRunner.manager.delete).not.toHaveBeenCalled();
      expect(queryRunner.manager.save).not.toHaveBeenCalled();
    });

    it.each([
      'name',
      'regionLabel',
      'heroNarrative',
      'editorIntro',
      'foodTitle',
      'foodDescription',
    ] as const)('preserves omitted zh for %s', async (key) => {
      const zh = stored[key].zh;
      await service.update(stored.id, { [key]: { en: 'Edited English' } });
      expect(stored[key]).toEqual({ en: 'Edited English', zh });
    });

    it.each(['create', 'update', 'publish'] as const)(
      'rejects empty publication via %s without writes',
      async (operation) => {
        stored.published = false;
        stored.contentMarkdown = ' \n\t';
        stored.publishedAt = null;
        const pending =
          operation === 'create'
            ? service.create({
                slug: 'new-city',
                name: stored.name,
                contentMarkdown: stored.contentMarkdown,
                published: true,
              })
            : operation === 'update'
              ? service.update(stored.id, { published: true })
              : service.publish(stored.id);
        await expect(pending).rejects.toThrow(BadRequestException);
        expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
        expect(cityRepo.save).not.toHaveBeenCalled();
        expect(stored.published).toBe(false);
        expect(stored.publishedAt).toBeNull();
      },
    );

    it.each(['create', 'update', 'publish'] as const)(
      'rejects a blank English name via %s',
      async (operation) => {
        stored.name = { en: ' \n', zh: '非空' };
        const pending =
          operation === 'create'
            ? service.create({
                slug: 'new-city',
                name: stored.name,
                contentMarkdown: markdown,
                published: true,
              })
            : operation === 'update'
              ? service.update(stored.id, { published: true })
              : service.publish(stored.id);
        await expect(pending).rejects.toThrow(BadRequestException);
        expect(queryRunner.manager.update).not.toHaveBeenCalled();
      },
    );

    it('rejects clearing a published article without unpublishing', async () => {
      await expect(
        service.update(stored.id, { contentMarkdown: '' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(stored.id, { name: { en: ' ' } }),
      ).rejects.toThrow(BadRequestException);
      expect(queryRunner.manager.update).not.toHaveBeenCalled();
      await service.update(stored.id, {
        published: false,
        contentMarkdown: '',
      });
      expect(stored).toMatchObject({ published: false, contentMarkdown: '' });
    });

    it.each([null, 42, 'x'.repeat(200001)])(
      'rejects invalid Markdown on draft save',
      async (invalid) => {
        stored.published = false;
        await expect(
          service.update(stored.id, { contentMarkdown: invalid as string }),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.create({
            slug: 'new',
            name: { en: 'New' },
            contentMarkdown: invalid as string,
          }),
        ).rejects.toThrow(BadRequestException);
        expect(queryRunner.manager.update).not.toHaveBeenCalled();
      },
    );

    it('accepts the 200000 character boundary exactly', async () => {
      const contentMarkdown = 'x'.repeat(200000);
      await service.update(stored.id, { contentMarkdown });
      expect(stored.contentMarkdown).toBe(contentMarkdown);
    });

    it('retains first publication time across edits, unpublish, and publish', async () => {
      stored.publishedAt = null;
      stored.published = false;
      await service.publish(stored.id);
      const first = stored.publishedAt;
      expect(first).toBeInstanceOf(Date);
      await service.update(stored.id, { contentMarkdown: markdown });
      await service.unpublish(stored.id);
      await expect(service.findBySlugPublished(stored.slug)).rejects.toThrow(
        NotFoundException,
      );
      await service.update(stored.id, { published: true });
      await service.publish(stored.id);
      expect(stored.publishedAt).toEqual(first);
      expect(queryRunner.manager.query).toHaveBeenCalledWith(
        expect.stringContaining('COALESCE(published_at, CURRENT_TIMESTAMP)'),
        [stored.id],
      );
      expect(queryRunner.manager.delete).not.toHaveBeenCalled();
    });

    it('rolls back and reports a failed publish instead of returning success', async () => {
      stored.published = false;
      stored.publishedAt = null;
      queryRunner.manager.update.mockRejectedValueOnce(
        new Error('database unavailable'),
      );
      await expect(service.publish(stored.id)).rejects.toThrow(
        'database unavailable',
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(stored.publishedAt).toBeNull();
      expect(stored.published).toBe(false);
    });
  });

  describe('admin filters and public visibility', () => {
    it('passes q, false status and pagination from the admin controller', async () => {
      const spy = jest.spyOn(service, 'findAllAdmin');
      await new CitiesController(service).findAllAdmin(2, 10, 'Coast', false);
      expect(spy).toHaveBeenCalledWith(2, 10, 'Coast', false);
      expect(cityRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          where: [
            expect.objectContaining({ published: false }),
            expect.objectContaining({ published: false }),
          ],
        }),
      );
      const options = cityRepo.findAndCount!.mock.calls[0][0]!;
      const where = options.where as any[];
      expect(where[0].slug.value).toBe('%Coast%');
      expect(where[1].name.objectLiteralParameters).toEqual({ q: '%Coast%' });
    });

    it('filters published and draft statuses even without a search', async () => {
      await service.findAllAdmin(1, 20, undefined, true);
      expect(cityRepo.findAndCount).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { published: true } }),
      );
      await service.findAllAdmin(1, 20, undefined, false);
      expect(cityRepo.findAndCount).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { published: false } }),
      );
    });

    it('keeps search SQL parameterized and escapes wildcards', async () => {
      await service.findAllAdmin(1, 20, "  coast%'_  ");
      const where = cityRepo.findAndCount!.mock.calls[0][0]!.where as any[];
      expect(where[0].slug.value).toBe("%coast\\%'\\_%");
      expect(where[1].name.getSql('city.name')).not.toContain('coast');
      expect(where[1].name.getSql('City.name')).toBe('(\"City\".\"name\"->>\'en\' ILIKE :q OR \"City\".\"name\"->>\'zh\' ILIKE :q)');
      expect(where[1].name.getSql('city.name')).toContain("->>'en'");
    });

    it('supports the existing 200-city option loaders', async () => {
      await service.findAllAdmin(1, 200);
      expect(cityRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ take: 200 }));
    });

    it.each([
      [0, 20],
      [1, 0],
      [1, 201],
      [1.2, 10],
      [NaN, 10],
    ])('rejects invalid pagination %s/%s', async (page, limit) => {
      await expect(service.findAllAdmin(page, limit)).rejects.toThrow(
        BadRequestException,
      );
      expect(cityRepo.findAndCount).not.toHaveBeenCalled();
    });

    it('always constrains public queries to published nondeleted records', async () => {
      await service.findAllPublished();
      await service.findBySlugPublished(mockCity.slug);
      expect(cityRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { published: true } }),
      );
      expect(cityRepo.findOne).toHaveBeenCalledWith({
        where: { slug: mockCity.slug, published: true },
        relations: ['sections'],
      });
      expect(cityRepo.findAndCount!.mock.calls[0][0]!.withDeleted).not.toBe(
        true,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft remove the city', async () => {
      cityRepo.findOne!.mockResolvedValue(mockCity as any);

      await service.softDelete('uuid-city');
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.delete).toHaveBeenCalledWith(
        CityCultureSection,
        { cityId: 'uuid-city' },
      );
      expect(queryRunner.manager.query).toHaveBeenCalledWith(
        'DELETE FROM route_city_links WHERE city_id = $1',
        ['uuid-city'],
      );
      expect(queryRunner.manager.softDelete).toHaveBeenCalledWith(City, {
        id: 'uuid-city',
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
