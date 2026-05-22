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
        { provide: DataSource, useValue: {} },
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
      expect(cityRepo.softRemove).toHaveBeenCalled();
    });
  });
});
