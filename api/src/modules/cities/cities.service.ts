import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CityCultureSection } from './entities/city-section.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(CityCultureSection)
    private readonly sectionRepository: Repository<CityCultureSection>,
  ) {}

  // ── Public read ──

  async findAllPublished(
    page = 1,
    limit = 20,
  ): Promise<{ data: City[]; total: number }> {
    const [data, total] = await this.cityRepository.findAndCount({
      where: { published: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findBySlugPublished(slug: string): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { slug, published: true },
      relations: ['sections'],
    });
    if (!city) {
      throw new NotFoundException(`City with slug "${slug}" not found`);
    }
    // Sort sections by sortOrder
    city.sections.sort((a, b) => a.sortOrder - b.sortOrder);
    return city;
  }

  // ── Admin CRUD ──

  async findAllAdmin(
    page = 1,
    limit = 20,
  ): Promise<{ data: City[]; total: number }> {
    const [data, total] = await this.cityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      withDeleted: true,
    });
    return { data, total };
  }

  async findByIdAdmin(id: string): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['sections'],
      withDeleted: true,
    });
    if (!city) {
      throw new NotFoundException(`City with id "${id}" not found`);
    }
    city.sections.sort((a, b) => a.sortOrder - b.sortOrder);
    return city;
  }

  async create(dto: CreateCityDto): Promise<City> {
    // Check slug uniqueness
    const existing = await this.cityRepository.findOne({
      where: { slug: dto.slug },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(`City slug "${dto.slug}" already exists`);
    }

    const city = this.cityRepository.create({
      slug: dto.slug,
      name: dto.name,
      regionLabel: dto.regionLabel,
      heroImage: dto.heroImage,
      heroNarrative: dto.heroNarrative,
      tags: dto.tags ?? [],
      editorIntro: dto.editorIntro,
      galleryImages: dto.galleryImages ?? [],
      foodTitle: dto.foodTitle,
      foodDescription: dto.foodDescription,
      foodImages: dto.foodImages ?? [],
      published: dto.published ?? false,
    });

    const saved = await this.cityRepository.save(city);

    // Create sections if provided
    if (dto.sections?.length) {
      const sections = dto.sections.map((s, i) =>
        this.sectionRepository.create({
          cityId: saved.id,
          title: s.title,
          body: s.body,
          image: s.image,
          statLabel: s.statLabel ?? null,
          statValue: s.statValue ?? null,
          breathImage: s.breathImage ?? null,
          breathQuote: s.breathQuote ?? null,
          sortOrder: s.sortOrder ?? i,
        }),
      );
      await this.sectionRepository.save(sections);
      saved.sections = sections;
    }

    return saved;
  }

  async update(id: string, dto: UpdateCityDto): Promise<City> {
    const city = await this.findByIdAdmin(id);

    // Check slug uniqueness (exclude self)
    if (dto.slug && dto.slug !== city.slug) {
      const existing = await this.cityRepository.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`City slug "${dto.slug}" already exists`);
      }
    }

    Object.assign(city, dto);
    const saved = await this.cityRepository.save(city);

    // Replace sections if provided
    if (dto.sections !== undefined) {
      await this.sectionRepository.delete({ cityId: id });
      if (dto.sections.length > 0) {
        const sections = dto.sections.map((s, i) =>
          this.sectionRepository.create({
            cityId: id,
            title: s.title,
            body: s.body,
            image: s.image,
            statLabel: s.statLabel ?? null,
            statValue: s.statValue ?? null,
            breathImage: s.breathImage ?? null,
            breathQuote: s.breathQuote ?? null,
            sortOrder: s.sortOrder ?? i,
          }),
        );
        await this.sectionRepository.save(sections);
        saved.sections = sections;
      }
    }

    return saved;
  }

  async publish(id: string): Promise<City> {
    const city = await this.findByIdAdmin(id);
    city.published = true;
    return this.cityRepository.save(city);
  }

  async unpublish(id: string): Promise<City> {
    const city = await this.findByIdAdmin(id);
    city.published = false;
    return this.cityRepository.save(city);
  }

  async softDelete(id: string): Promise<void> {
    const city = await this.findByIdAdmin(id);
    await this.cityRepository.softRemove(city);
  }
}
