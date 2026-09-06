import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  ILike,
  Raw,
  Repository,
} from 'typeorm';
import { City } from './entities/city.entity';
import { CityCultureSection } from './entities/city-section.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Public read ──

  async findAllPublished(
    page = 1,
    limit = 20,
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    const [data, total] = await this.cityRepository.findAndCount({
      where: { published: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const routeRows =
      data.length === 0
        ? []
        : await this.cityRepository.manager.query(
            `SELECT l.city_id AS "cityId", r.slug
             FROM route_city_links l
             INNER JOIN story_routes r
               ON r.id = l.route_id AND r.published = true
             WHERE l.city_id = ANY($1::uuid[])
             ORDER BY l.sort_order ASC`,
            [data.map((city) => city.id)],
          );

    const routesByCityId = new Map<string, { slug: string }[]>();
    for (const row of routeRows as Array<{ cityId: string; slug: string }>) {
      const list = routesByCityId.get(row.cityId) ?? [];
      list.push({ slug: row.slug });
      routesByCityId.set(row.cityId, list);
    }

    const enriched = data.map((city) => ({
      ...city,
      routes: routesByCityId.get(city.id) ?? [],
    }));

    return { data: enriched, total, page, pageSize: limit };
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
      routes: routes.map((routeRow: { slug: string }) => ({
        slug: routeRow.slug,
      })),
    };
  }

  // ── Admin CRUD ──

  async findAllAdmin(
    page = 1,
    limit = 20,
    q?: string,
    published?: boolean,
  ): Promise<{ data: City[]; total: number; page: number; pageSize: number }> {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 200
    ) {
      throw new BadRequestException(
        'page must be positive and limit must be between 1 and 200',
      );
    }
    const status: FindOptionsWhere<City> =
      published === undefined ? {} : { published };
    const keyword = q?.trim();
    const pattern = `%${keyword?.replace(/[\\%_]/g, '\\$&')}%`;
    const where: FindOptionsWhere<City> | FindOptionsWhere<City>[] = keyword
      ? [
          { ...status, slug: ILike(pattern) },
          {
            ...status,
            name: Raw(
              (alias) => {
                const column = alias.split('.').map((part) => `"${part}"`).join('.');
                return `(${column}->>'en' ILIKE :q OR ${column}->>'zh' ILIKE :q)`;
              },
              { q: pattern },
            ),
          },
        ]
      : status;
    const [data, total] = await this.cityRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      withDeleted: true,
    });
    return { data, total, page, pageSize: limit };
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
    return {
      ...city,
      routeSlugs: routes.map((routeRow: { slug: string }) => routeRow.slug),
    } as City;
  }

  async create(dto: CreateCityDto): Promise<City> {
    const contentMarkdown =
      dto.contentMarkdown === undefined ? '' : dto.contentMarkdown;
    this.validateMarkdown(contentMarkdown);
    if (dto.published) this.validatePublication(dto.name, contentMarkdown);

    // Check slug uniqueness
    const existing = await this.cityRepository.findOne({
      where: { slug: dto.slug },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(`City slug "${dto.slug}" already exists`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const city = queryRunner.manager.create(City, {
        slug: dto.slug,
        name: this.normalizeI18nObject(dto.name),
        regionLabel: this.normalizeI18nObject(dto.regionLabel),
        heroImage: dto.heroImage ?? '',
        heroMedia: dto.heroMedia ?? null,
        heroNarrative: this.normalizeI18nObject(dto.heroNarrative),
        tags: this.normalizeI18nArray(dto.tags),
        editorIntro: this.normalizeI18nObject(dto.editorIntro),
        galleryImages: dto.galleryImages ?? [],
        galleryMedia: dto.galleryMedia ?? [],
        foodTitle: this.normalizeI18nObject(dto.foodTitle),
        foodDescription: this.normalizeI18nObject(dto.foodDescription),
        foodImages: dto.foodImages ?? [],
        relatedCitySlugs: dto.relatedCitySlugs ?? [],
        adcode: dto.adcode,
        published: dto.published ?? false,
        contentMarkdown,
        publishedAt: dto.published ? new Date() : null,
      });

      const saved = await queryRunner.manager.save(city);

      if (dto.sections?.length) {
        const sections = dto.sections.map((s, i) =>
          queryRunner.manager.create(CityCultureSection, {
            cityId: saved.id,
            title: this.normalizeI18nObject(s.title),
            body: this.normalizeI18nObject(s.body),
            image: s.image,
            primaryMedia: s.primaryMedia ?? null,
            images: s.images ?? [],
            media: s.media ?? [],
            statLabel: s.statLabel
              ? this.normalizeI18nObject(s.statLabel)
              : null,
            statValue: s.statValue
              ? this.normalizeI18nObject(s.statValue)
              : null,
            breathImage: s.breathImage ?? null,
            breathQuote: s.breathQuote
              ? this.normalizeI18nObject(s.breathQuote)
              : null,
            sortOrder: s.sortOrder ?? i,
          }),
        );
        await queryRunner.manager.save(sections);
        saved.sections = sections;
      }

      if (dto.routeSlugs?.length) {
        await this.replaceRouteLinks(
          queryRunner.manager,
          saved.id,
          dto.routeSlugs,
        );
      }

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateCityDto): Promise<City> {
    const city = await this.findByIdAdmin(id);
    const {
      sections: _sectionsFromDto,
      routeSlugs: _routeSlugsFromDto,
      ...scalarUpdates
    } = dto;
    const normalizedScalarUpdates = this.normalizeCityScalarUpdates(
      scalarUpdates,
      city,
    );
    const contentMarkdown =
      dto.contentMarkdown === undefined
        ? city.contentMarkdown
        : dto.contentMarkdown;
    if (dto.contentMarkdown !== undefined)
      this.validateMarkdown(contentMarkdown);
    if (dto.published ?? city.published) {
      this.validatePublication(
        normalizedScalarUpdates.name ?? city.name,
        contentMarkdown,
      );
    }

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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Apply scalar fields only — sections are managed explicitly below to avoid
      // OneToMany cascade conflicting with the delete-and-recreate approach.
      if (Object.keys(normalizedScalarUpdates).length) {
        await queryRunner.manager.update(City, id, normalizedScalarUpdates);
      }
      if (dto.published === true) {
        // Set once atomically, including when two publish requests overlap.
        await queryRunner.manager.query(
          'UPDATE cities SET published_at = COALESCE(published_at, CURRENT_TIMESTAMP) WHERE id = $1',
          [id],
        );
      }
      const saved = await queryRunner.manager.findOneOrFail(City, {
        where: { id },
      });

      if (dto.sections !== undefined) {
        await queryRunner.manager.delete(CityCultureSection, { cityId: id });
        if (dto.sections.length > 0) {
          const sections = dto.sections.map((s, i) =>
            queryRunner.manager.create(CityCultureSection, {
              cityId: id,
              title: this.normalizeI18nObject(s.title),
              body: this.normalizeI18nObject(s.body),
              image: s.image,
              primaryMedia: s.primaryMedia ?? null,
              images: s.images ?? [],
              media: s.media ?? [],
              statLabel: s.statLabel
                ? this.normalizeI18nObject(s.statLabel)
                : null,
              statValue: s.statValue
                ? this.normalizeI18nObject(s.statValue)
                : null,
              breathImage: s.breathImage ?? null,
              breathQuote: s.breathQuote
                ? this.normalizeI18nObject(s.breathQuote)
                : null,
              sortOrder: s.sortOrder ?? i,
            }),
          );
          await queryRunner.manager.save(sections);
          saved.sections = sections;
        } else {
          saved.sections = [];
        }
      }

      if (dto.routeSlugs !== undefined) {
        await this.replaceRouteLinks(queryRunner.manager, id, dto.routeSlugs);
      }

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async publish(id: string): Promise<City> {
    return this.update(id, { published: true });
  }

  async unpublish(id: string): Promise<City> {
    return this.update(id, { published: false });
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdAdmin(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(CityCultureSection, { cityId: id });
      await queryRunner.manager.query(
        'DELETE FROM route_city_links WHERE city_id = $1',
        [id],
      );
      await queryRunner.manager.softDelete(City, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async replaceRouteLinks(
    manager: EntityManager,
    cityId: string,
    routeSlugs: string[],
  ) {
    await manager.query('DELETE FROM route_city_links WHERE city_id = $1', [
      cityId,
    ]);
    if (!routeSlugs.length) return;
    const routes = await manager.query(
      'SELECT id, slug FROM story_routes WHERE slug = ANY($1::text[])',
      [routeSlugs],
    );
    for (const route of routes) {
      const sortOrder = routeSlugs.indexOf(route.slug);
      await manager.query(
        `INSERT INTO route_city_links (route_id, city_id, sort_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (route_id, city_id) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
        [route.id, cityId, sortOrder],
      );
    }
  }

  private validateMarkdown(content: unknown): asserts content is string {
    if (typeof content !== 'string' || content.length > 200000) {
      throw new BadRequestException(
        'contentMarkdown must be a string of at most 200000 characters',
      );
    }
  }

  private validatePublication(
    name: { en?: string } | undefined,
    content: unknown,
  ): void {
    this.validateMarkdown(content);
    if (typeof name?.en !== 'string' || !name.en.trim() || !content.trim()) {
      throw new BadRequestException(
        'Publishing requires a nonblank English name and contentMarkdown',
      );
    }
  }

  private normalizeCityScalarUpdates(
    scalarUpdates: Partial<CreateCityDto>,
    city: City,
  ): Partial<City> {
    const updates: Partial<City> = {};
    const textKeys = [
      'name',
      'regionLabel',
      'heroNarrative',
      'editorIntro',
      'foodTitle',
      'foodDescription',
    ] as const;
    for (const key of textKeys) {
      if (scalarUpdates[key] !== undefined) {
        updates[key] = this.normalizeI18nObject({
          ...city[key],
          ...scalarUpdates[key],
        });
      }
    }
    const otherKeys = [
      'slug',
      'heroImage',
      'heroMedia',
      'galleryImages',
      'galleryMedia',
      'foodImages',
      'relatedCitySlugs',
      'adcode',
      'published',
      'contentMarkdown',
    ] as const;
    for (const key of otherKeys) {
      if (scalarUpdates[key] !== undefined) {
        Object.assign(updates, { [key]: scalarUpdates[key] });
      }
    }
    if (scalarUpdates.tags !== undefined) {
      updates.tags = this.normalizeI18nArray(scalarUpdates.tags);
    }
    return updates;
  }

  private normalizeI18nArray(
    value: Array<{ en: string; zh: string }> | undefined,
  ): Array<{ en: string; zh: string }> {
    if (!Array.isArray(value)) return [];
    return value.map((item) => this.normalizeI18nObject(item));
  }

  private normalizeI18nObject(value: any): { en: string; zh: string } {
    const arrayLikeValue = value as Array<any> & {
      en?: unknown;
      zh?: unknown;
    };
    const source =
      Array.isArray(value) && value !== null
        ? {
            en: arrayLikeValue.en,
            zh: arrayLikeValue.zh,
          }
        : (value ?? {});

    return {
      en: typeof source.en === 'string' ? source.en : '',
      zh: typeof source.zh === 'string' ? source.zh : '',
    };
  }
}
