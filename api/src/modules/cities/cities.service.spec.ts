import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';
import { CityCultureSection } from './entities/city-section.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

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
      },
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
