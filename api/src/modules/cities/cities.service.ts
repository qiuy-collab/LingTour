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
  ): Promise<{ data: any[]; total: number }> {
    const [data, total] = await this.cityRepository.findAndCount({
      where: { published: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Enriched with routes
    const enriched = await Promise.all(
      data.map(async (city) => {
        const routes = await this.cityRepository.manager.query(
          `SELECT r.slug FROM story_routes r
           INNER JOIN route_city_links l ON l.route_id = r.id
           WHERE l.city_id = $1 AND r.published = true`,
          [city.id],
        );
        return {
          ...city,
          routes: routes.map((r: any) => ({ slug: r.slug })),
        };
      }),
    );

    return { data: enriched, total };
  }

  async findBySlugPublished(slug: string): Promise<any> {
    const city = await this.cityRepository.findOne({
      where: { slug, published: true },
      relations: ['sections'],
    });
    if (!city) {
      throw new NotFoundException(`City with slug "${slug}" not found`);
    }
    // Sort sections by sortOrder
    city.sections.sort((a, b) => a.sortOrder - b.sortOrder);

    // Load linked routes
    const routes = await this.cityRepository.manager.query(
      `SELECT r.slug FROM story_routes r
       INNER JOIN route_city_links l ON l.route_id = r.id
       WHERE l.city_id = $1 AND r.published = true`,
      [city.id],
    );

    return {
      ...city,
      routes: routes.map((r: any) => ({ slug: r.slug })),
    };
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
    const routes = await this.cityRepository.manager.query(
      `SELECT r.slug FROM story_routes r
       INNER JOIN route_city_links l ON l.route_id = r.id
       WHERE l.city_id = $1
       ORDER BY l.sort_order ASC`,
      [city.id],
    );
    return { ...city, routeSlugs: routes.map((r: any) => r.slug) } as City;
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
      relatedCitySlugs: dto.relatedCitySlugs ?? [],
      adcode: dto.adcode,
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

    if (dto.routeSlugs?.length) {
      await this.replaceRouteLinks(saved.id, dto.routeSlugs);
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

    if (dto.routeSlugs !== undefined) {
      await this.replaceRouteLinks(id, dto.routeSlugs);
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

  private async replaceRouteLinks(cityId: string, routeSlugs: string[]) {
    await this.cityRepository.manager.query('DELETE FROM route_city_links WHERE city_id = $1', [cityId]);
    if (!routeSlugs.length) return;
    const routes = await this.cityRepository.manager.query(
      'SELECT id, slug FROM story_routes WHERE slug = ANY($1)',
      [routeSlugs],
    );
    for (const route of routes) {
      const sortOrder = routeSlugs.indexOf(route.slug);
      await this.cityRepository.manager.query(
        `INSERT INTO route_city_links (route_id, city_id, sort_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (route_id, city_id) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
        [route.id, cityId, sortOrder],
      );
    }
  }
}
