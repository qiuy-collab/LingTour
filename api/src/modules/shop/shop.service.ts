import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StoreProduct } from './entities/store-product.entity';
import { StoreCollection } from './entities/store-collection.entity';
import { FrontendFeatured } from './entities/featured.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(StoreProduct)
    private readonly productRepo: Repository<StoreProduct>,
    @InjectRepository(StoreCollection)
    private readonly collectionRepo: Repository<StoreCollection>,
    @InjectRepository(FrontendFeatured)
    private readonly featuredRepo: Repository<FrontendFeatured>,
    private readonly dataSource: DataSource,
  ) {}

  private toPublicProduct(product: StoreProduct) {
    return {
      slug: product.slug,
      price: Number(product.price),
      currency: product.currency,
      image: product.image,
      gallery: product.gallery ?? [],
      collection: product.collection
        ? {
            slug: product.collection.slug,
            title: product.collection.title,
          }
        : null,
      product: {
        name: product.name,
        tag: product.tag,
      },
      materialNotes: product.material,
      story: product.story,
    };
  }

  // ── Collections (Public) ──

  async findAllCollections(): Promise<{ collections: any[] }> {
    const collections = await this.collectionRepo.find({
      where: { published: true },
      order: { sortOrder: 'ASC' },
    });

    // Resolve product counts
    const counts = await this.productRepo
      .createQueryBuilder('p')
      .select('p.collection_id', 'collectionId')
      .addSelect('COUNT(p.id)', 'count')
      .where('p.collection_id IN (:...ids)', {
        ids: collections.length ? collections.map((c) => c.id) : ['none'],
      })
      .andWhere('p.published = :published', { published: true })
      .groupBy('p.collection_id')
      .getRawMany();

    const countMap = new Map(counts.map((c) => [c.collectionId, +c.count]));
    return {
      collections: collections.map((c) => ({
        ...c,
        productCount: countMap.get(c.id) ?? 0,
      })),
    };
  }

  // ── Products (Public) ──

  async findAllProducts(
    collection?: string,
    tag?: string,
    page = 1,
    limit = 12,
  ) {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.collection', 'collection')
      .where('p.published = :published', { published: true });

    if (collection) {
      qb.andWhere('collection.slug = :collection', { collection });
    }
    if (tag) {
      qb.andWhere("p.tag->>'en' ILIKE :tag OR p.tag->>'zh' ILIKE :tag", {
        tag: `%${tag}%`,
      });
    }

    const [products, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('p.createdAt', 'DESC')
      .getManyAndCount();

    // Get distinct tags & collections for filters
    const allTags = await this.productRepo
      .createQueryBuilder('p')
      .select("p.tag->>'en'", 'tag_en')
      .addSelect("p.tag->>'zh'", 'tag_zh')
      .distinct(true)
      .where('p.published = :published', { published: true })
      .getRawMany();

    const allCollections = await this.collectionRepo
      .createQueryBuilder('c')
      .select('c.slug', 'slug')
      .distinct(true)
      .where('c.published = :published', { published: true })
      .getRawMany();

    return {
      products: products.map((product) => this.toPublicProduct(product)),
      pagination: { page: +page, limit: +limit, total },
      filters: {
        collections: allCollections.map((c) => c.slug),
        tags: allTags.map((t) => [t.tag_en, t.tag_zh]).flat(),
      },
    };
  }

  async findBySlugPublished(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug, published: true },
      relations: ['collection'],
    });
    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    // Related products (same collection)
    let related: StoreProduct[] = [];
    if (product.collectionId) {
      related = await this.productRepo.find({
        where: {
          collectionId: product.collectionId,
          published: true,
        },
        take: 4,
      });
    }

    return {
      product: this.toPublicProduct(product),
      relatedProducts: related
        .filter((p) => p.id !== product.id)
        .slice(0, 3)
        .map((item) => this.toPublicProduct(item)),
    };
  }

  // ── Featured (Public) ──

  async getFeatured(section = 'shop') {
    const featured = await this.featuredRepo.find({
      where: { section },
      order: { sortOrder: 'ASC' },
    });

    if (!featured.length) {
      // Fallback: latest 3 published products
      const products = await this.productRepo.find({
        where: { published: true },
        order: { createdAt: 'DESC' },
        take: 3,
        relations: ['collection'],
      });
      return {
        section,
        products: products.map((product) => this.toPublicProduct(product)),
      };
    }

    const productIds = featured
      .filter((f) => f.refType === 'product')
      .map((f) => f.refId);

    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.collection', 'collection')
      .where('p.id IN (:...ids)', {
        ids: productIds.length ? productIds : ['none'],
      })
      .getMany();

    // Sort in featured order
    const idOrder = new Map(productIds.map((id, i) => [id, i]));
    products.sort(
      (a, b) => (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999),
    );

    return {
      section,
      products: products.map((product) => this.toPublicProduct(product)),
    };
  }

  // ── Admin: Products ──

  async findAllProductsAdmin(
    page = 1,
    limit = 20,
    collectionId?: string,
    q?: string,
  ) {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.collection', 'collection')
      .withDeleted();

    if (collectionId) {
      qb.andWhere('p.collection_id = :collectionId', { collectionId });
    }
    if (q) {
      qb.andWhere('(p.slug ILIKE :q OR p.name::text ILIKE :q)', {
        q: `%${q}%`,
      });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('p.updatedAt', 'DESC')
      .getManyAndCount();

    return { items: data, total, page: +page, size: +limit };
  }

  async findProductByIdAdmin(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['collection'],
      withDeleted: true,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const existing = await this.productRepo.findOne({
      where: { slug: dto.slug },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(`Product slug "${dto.slug}" already exists`);
    }
    return this.productRepo.save(
      this.productRepo.create({
        ...dto,
        gallery: dto.gallery ?? [],
        currency: dto.currency ?? 'SGD',
        stock: dto.stock ?? 0,
        published: dto.published ?? false,
      }),
    );
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.findProductByIdAdmin(id);
    if (dto.slug && dto.slug !== product.slug) {
      const dup = await this.productRepo.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      });
      if (dup)
        throw new ConflictException(
          `Product slug "${dto.slug}" already exists`,
        );
    }
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async softDeleteProduct(id: string) {
    const product = await this.findProductByIdAdmin(id);
    await this.productRepo.softRemove(product);
    return { deleted: true };
  }

  // ── Admin: Collections ──

  async findAllCollectionsAdmin() {
    return this.collectionRepo.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findCollectionByIdAdmin(id: string) {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async createCollection(dto: CreateCollectionDto) {
    const existing = await this.collectionRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existing)
      throw new ConflictException(
        `Collection slug "${dto.slug}" already exists`,
      );
    return this.collectionRepo.save(this.collectionRepo.create(dto));
  }

  async updateCollection(id: string, dto: UpdateCollectionDto) {
    const col = await this.findCollectionByIdAdmin(id);
    if (dto.slug && dto.slug !== col.slug) {
      const dup = await this.collectionRepo.findOne({
        where: { slug: dto.slug },
      });
      if (dup)
        throw new ConflictException(
          `Collection slug "${dto.slug}" already exists`,
        );
    }
    Object.assign(col, dto);
    return this.collectionRepo.save(col);
  }

  async deleteCollection(id: string) {
    // Check no products linked
    const productCount = await this.productRepo.count({
      where: { collectionId: id },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete collection with ${productCount} products. Reassign or remove them first.`,
      );
    }
    await this.collectionRepo.delete(id);
    return { deleted: true };
  }

  // ── Admin: Featured ──

  async setFeatured(section: string, productIds: string[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(FrontendFeatured, { section });
      const entries = productIds.map((refId, i) =>
        queryRunner.manager.create(FrontendFeatured, {
          section,
          refType: 'product',
          refId,
          sortOrder: i,
        }),
      );
      await queryRunner.manager.save(entries);
      await queryRunner.commitTransaction();
      return { section, productIds, count: productIds.length };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getFeaturedAdmin(section = 'shop') {
    return this.featuredRepo.find({
      where: { section },
      order: { sortOrder: 'ASC' },
    });
  }
}
