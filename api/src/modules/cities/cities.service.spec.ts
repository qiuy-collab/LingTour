import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';
import { CityCultureSection } from './entities/city-section.entity';

describe('CitiesService English-only content contract', () => {
  let service: CitiesService;
  let cityRepo: any;
  let queryRunner: any;

  const city: City = {
    id: 'city-id',
    slug: 'zhanjiang',
    name: 'Zhanjiang',
    regionLabel: 'Southern coast',
    heroImage: '/uploads/hero.jpg',
    heroMedia: null,
    heroNarrative: 'A city shaped by sea and basalt.',
    tags: ['Coast'],
    editorIntro: '## Zhanjiang',
    contentMarkdown: '# Field notes',
    galleryImages: [],
    galleryMedia: [],
    foodTitle: 'Local food',
    foodDescription: 'Seafood and market breakfasts.',
    foodImages: [],
    relatedCitySlugs: [],
    adcode: 440800,
    published: false,
    publishedAt: null,
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
        create: jest.fn((_entity, values) => ({ ...values, id: city.id, sections: [] })),
        save: jest.fn(async (value) => value),
        update: jest.fn(),
        findOneOrFail: jest.fn(async () => ({ ...city })),
        delete: jest.fn(),
        query: jest.fn().mockResolvedValue([]),
        softDelete: jest.fn(),
      },
    };

    cityRepo = {
      findAndCount: jest.fn().mockResolvedValue([[city], 1]),
      findOne: jest.fn().mockResolvedValue({ ...city }),
      create: jest.fn((values) => ({ ...city, ...values })),
      save: jest.fn(async (value) => value),
      manager: { query: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        { provide: getRepositoryToken(City), useValue: cityRepo },
        { provide: getRepositoryToken(CityCultureSection), useValue: {} },
        { provide: DataSource, useValue: { createQueryRunner: jest.fn(() => queryRunner) } },
      ],
    }).compile();

    service = module.get(CitiesService);
  });

  it('creates and persists English scalar fields and string tags', async () => {
    cityRepo.findOne!.mockResolvedValueOnce(null);

    const result = await service.create({
      slug: 'new-city',
      name: 'New City',
      regionLabel: 'Southern coast',
      heroNarrative: 'A clear English narrative.',
      editorIntro: '## New City',
      tags: ['Coast', 'Market'],
      foodTitle: 'Food',
      foodDescription: 'Food notes',
    });

    expect(result).toMatchObject({
      name: 'New City',
      tags: ['Coast', 'Market'],
      editorIntro: '## New City',
    });
    expect(queryRunner.manager.create).toHaveBeenCalledWith(
      City,
      expect.objectContaining({ name: 'New City', tags: ['Coast', 'Market'] }),
    );
  });

  it('updates content without rebuilding a bilingual object', async () => {
    const result = await service.update(city.id, {
      name: 'Edited City',
      tags: ['Edited'],
      contentMarkdown: '# Updated',
    });

    expect(queryRunner.manager.update).toHaveBeenCalledWith(City, city.id, {
      name: 'Edited City',
      tags: ['Edited'],
      contentMarkdown: '# Updated',
    });
    expect(result).toBeTruthy();
  });

  it('rejects publishing without English name and Markdown content', async () => {
    cityRepo.findOne!.mockResolvedValueOnce(null);
    await expect(
      service.create({
        slug: 'empty-city',
        name: ' ',
        contentMarkdown: ' ',
        published: true,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(queryRunner.connect).not.toHaveBeenCalled();
  });

  it('rejects duplicate slugs before opening a write transaction', async () => {
    cityRepo.findOne!.mockResolvedValueOnce(city);
    await expect(
      service.create({ slug: city.slug, name: 'Duplicate' }),
    ).rejects.toThrow(ConflictException);
    expect(queryRunner.connect).not.toHaveBeenCalled();
  });
});
