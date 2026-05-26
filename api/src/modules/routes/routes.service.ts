import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StoryRoute } from './entities/story-route.entity';
import { RouteStop } from './entities/route-stop.entity';
import { RouteCityLink } from './entities/route-city-link.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(StoryRoute)
    private readonly routeRepository: Repository<StoryRoute>,
    @InjectRepository(RouteStop)
    private readonly stopRepository: Repository<RouteStop>,
    @InjectRepository(RouteCityLink)
    private readonly linkRepository: Repository<RouteCityLink>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Public read ──

  async findAllPublished(citySlug?: string, page = 1, limit = 20) {
    const qb = this.routeRepository
      .createQueryBuilder('route')
      .where('route.published = :published', { published: true });

    if (citySlug) {
      qb.innerJoin(
        'route_city_links',
        'link',
        'link.route_id = route.id',
      ).innerJoin(
        'cities',
        'city',
        'city.id = link.city_id AND city.slug = :citySlug',
        {
          citySlug,
        },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('route.createdAt', 'ASC')
      .getManyAndCount();

    // Attach stop count
    const stopCounts = await this.stopRepository
      .createQueryBuilder('stop')
      .select('stop.route_id', 'routeId')
      .addSelect('COUNT(stop.id)', 'count')
      .where('stop.route_id IN (:...ids)', {
        ids: data.length ? data.map((r) => r.id) : ['none'],
      })
      .groupBy('stop.route_id')
      .getRawMany();

    const countMap = new Map(stopCounts.map((s) => [s.routeId, +s.count]));
    const enriched = data.map((route) => ({
      ...route,
      stopCount: countMap.get(route.id) ?? 0,
    }));

    return { data: enriched, total, page: +page, limit: +limit };
  }

  async findBySlugPublished(slug: string): Promise<any> {
    const route = await this.routeRepository.findOne({
      where: { slug, published: true },
      relations: ['stops'],
    });
    if (!route) {
      throw new NotFoundException(`Route "${slug}" not found`);
    }

    route.stops.sort((a, b) => a.sortOrder - b.sortOrder);

    // Load linked cities
    const links = await this.linkRepository
      .createQueryBuilder('link')
      .innerJoinAndSelect('cities', 'city', 'city.id = link.city_id')
      .where('link.route_id = :routeId', { routeId: route.id })
      .orderBy('link.sortOrder', 'ASC')
      .getRawMany();

    return {
      ...route,
      cities: links.map((l) => ({
        slug: l.city_slug,
        name: l.city_name,
        label: l.city_region_label,
        tags: l.city_tags,
        gallery: l.city_gallery_images?.[0] ? [l.city_gallery_images[0]] : [],
      })),
    };
  }

  // ── Admin CRUD ──

  async findAllAdmin(
    page = 1,
    limit = 20,
    q?: string,
    culture?: string,
    published?: boolean,
  ) {
    const qb = this.routeRepository.createQueryBuilder('route').withDeleted();

    if (q) {
      qb.andWhere(`(route.slug ILIKE :q OR route.title::text ILIKE :q)`, {
        q: `%${q}%`,
      });
    }
    if (culture) {
      qb.andWhere('route.cultureTag = :culture', { culture });
    }
    if (published !== undefined) {
      qb.andWhere('route.published = :published', { published });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('route.updatedAt', 'DESC')
      .getManyAndCount();

    // Attach stop counts
    const stopCounts = await this.stopRepository
      .createQueryBuilder('stop')
      .select('stop.route_id', 'routeId')
      .addSelect('COUNT(stop.id)', 'count')
      .where('stop.route_id IN (:...ids)', {
        ids: data.length ? data.map((r) => r.id) : ['none'],
      })
      .groupBy('stop.route_id')
      .getRawMany();

    const countMap = new Map(stopCounts.map((s) => [s.routeId, +s.count]));
    const enriched = data.map((route) => ({
      ...route,
      stopCount: countMap.get(route.id) ?? 0,
    }));

    return { items: enriched, total, page: +page, size: +limit };
  }

  async findByIdAdmin(id: string): Promise<any> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['stops'],
      withDeleted: true,
    });
    if (!route) {
      throw new NotFoundException(`Route not found`);
    }
    route.stops.sort((a, b) => a.sortOrder - b.sortOrder);

    // Load city slugs
    const links = await this.linkRepository
      .createQueryBuilder('link')
      .innerJoin('cities', 'city', 'city.id = link.city_id')
      .select('city.slug', 'slug')
      .where('link.route_id = :id', { id })
      .orderBy('link.sort_order', 'ASC')
      .getRawMany();

    return {
      ...route,
      citySlugs: links.map((l) => l.slug),
    };
  }

  async create(dto: CreateRouteDto): Promise<StoryRoute> {
    const existing = await this.routeRepository.findOne({
      where: { slug: dto.slug },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(`Route slug "${dto.slug}" already exists`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Insert route
      const route = queryRunner.manager.create(StoryRoute, {
        slug: dto.slug,
        title: dto.title,
        cultureTag: dto.cultureTag,
        cityName: dto.cityName,
        duration: dto.duration,
        audience: dto.audience,
        summary: dto.summary,
        story: dto.story,
        coverImage: dto.coverImage,
        published: dto.published ?? false,
      });
      const saved = await queryRunner.manager.save(route);

      // 2. Insert stops
      if (dto.stops?.length) {
        const stops = dto.stops.map((s) =>
          queryRunner.manager.create(RouteStop, {
            routeId: saved.id,
            sortOrder: s.sortOrder,
            time: s.time,
            stopName: s.stopName,
            story: s.story,
            culturalStory: s.culturalStory,
            details: s.details ?? [],
            image: s.image,
            lat: s.lat ?? null,
            lng: s.lng ?? null,
            meal: s.meal ?? null,
            hotel: s.hotel ?? null,
            transit: s.transit ?? null,
          }),
        );
        await queryRunner.manager.save(stops);
      }

      // 3. Insert city links (resolve slugs to IDs)
      if (dto.citySlugs?.length) {
        const cities = await queryRunner.manager
          .createQueryBuilder()
          .select('c.id', 'id')
          .addSelect('c.slug', 'slug')
          .from('cities', 'c')
          .where('c.slug IN (:...slugs)', { slugs: dto.citySlugs })
          .getRawMany();

        const links = cities.map((c: any, i: number) =>
          queryRunner.manager.create(RouteCityLink, {
            routeId: saved.id,
            cityId: c.id,
            sortOrder: i,
          }),
        );
        await queryRunner.manager.save(links);
      }

      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateRouteDto): Promise<StoryRoute> {
    const existing = await this.routeRepository.findOne({
      where: { id },
      relations: ['stops'],
      withDeleted: true,
    });
    if (!existing) {
      throw new NotFoundException(`Route not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const dup = await this.routeRepository.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      });
      if (dup) {
        throw new ConflictException(`Route slug "${dto.slug}" already exists`);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const scalarUpdates: Partial<StoryRoute> = {
        slug: dto.slug ?? existing.slug,
        title: dto.title ?? existing.title,
        cultureTag: dto.cultureTag ?? existing.cultureTag,
        cityName: dto.cityName ?? existing.cityName,
        duration: dto.duration ?? existing.duration,
        audience: dto.audience ?? existing.audience,
        summary: dto.summary ?? existing.summary,
        story: dto.story ?? existing.story,
        coverImage: dto.coverImage ?? existing.coverImage,
        published: dto.published ?? existing.published,
      };

      await queryRunner.manager.update(StoryRoute, id, scalarUpdates);
      const saved = await queryRunner.manager.findOneByOrFail(StoryRoute, { id });

      // Replace stops
      if (dto.stops !== undefined) {
        await queryRunner.manager.delete(RouteStop, { routeId: id });
        if (dto.stops.length) {
          const stops = dto.stops.map((s) =>
            queryRunner.manager.create(RouteStop, {
              routeId: id,
              sortOrder: s.sortOrder,
              time: s.time,
              stopName: s.stopName,
              story: s.story,
              culturalStory: s.culturalStory,
              details: s.details ?? [],
              image: s.image,
              lat: s.lat ?? null,
              lng: s.lng ?? null,
              meal: s.meal ?? null,
              hotel: s.hotel ?? null,
              transit: s.transit ?? null,
            }),
          );
          await queryRunner.manager.save(stops);
        }
      }

      // Replace city links
      if (dto.citySlugs !== undefined) {
        await queryRunner.manager.delete(RouteCityLink, { routeId: id });
        if (dto.citySlugs.length) {
          const cities = await queryRunner.manager
            .createQueryBuilder()
            .select('c.id', 'id')
            .addSelect('c.slug', 'slug')
            .from('cities', 'c')
            .where('c.slug IN (:...slugs)', { slugs: dto.citySlugs })
            .getRawMany();

          const links = cities.map((c: any, i: number) =>
            queryRunner.manager.create(RouteCityLink, {
              routeId: id,
              cityId: c.id,
              sortOrder: i,
            }),
          );
          await queryRunner.manager.save(links);
        }
      }

      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async publish(id: string): Promise<StoryRoute> {
    const route = (await this.findByIdAdmin(id)) as StoryRoute;
    route.published = true;
    return this.routeRepository.save(route);
  }

  async unpublish(id: string): Promise<StoryRoute> {
    const route = (await this.findByIdAdmin(id)) as StoryRoute;
    route.published = false;
    return this.routeRepository.save(route);
  }

  async softDelete(id: string): Promise<void> {
    const route = await this.routeRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!route) {
      throw new NotFoundException(`Route not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(RouteStop, { routeId: id });
      await queryRunner.manager.delete(RouteCityLink, { routeId: id });
      await queryRunner.manager.softDelete(StoryRoute, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getStats(): Promise<{ routeCount: number }> {
    const count = await this.routeRepository.count({
      where: { published: true },
    });
    return { routeCount: count };
  }
}
