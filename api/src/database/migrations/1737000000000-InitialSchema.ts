import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1737000000000 implements MigrationInterface {
  name = 'InitialSchema1737000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. users
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'editor',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        name VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_users_email ON users(email);
    `);

    // 2. cities
    await queryRunner.query(`
      CREATE TABLE cities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) NOT NULL UNIQUE,
        name JSONB NOT NULL,
        region_label JSONB NOT NULL,
        hero_image VARCHAR(500) NOT NULL,
        hero_narrative JSONB NOT NULL,
        tags JSONB NOT NULL DEFAULT '[]',
        editor_intro JSONB NOT NULL,
        gallery_images JSONB NOT NULL DEFAULT '[]',
        food_title JSONB NOT NULL,
        food_description JSONB NOT NULL,
        food_images JSONB NOT NULL DEFAULT '[]',
        published BOOLEAN NOT NULL DEFAULT false,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_cities_slug ON cities(slug);
      CREATE INDEX idx_cities_published ON cities(published);
    `);

    // 3. city_culture_sections
    await queryRunner.query(`
      CREATE TABLE city_culture_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
        title JSONB NOT NULL,
        body JSONB NOT NULL,
        image VARCHAR(500) NOT NULL,
        stat_label JSONB,
        stat_value JSONB,
        breath_image VARCHAR(500),
        breath_quote JSONB,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_city_sections ON city_culture_sections(city_id, sort_order);
    `);

    // 4. story_routes
    await queryRunner.query(`
      CREATE TABLE story_routes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) NOT NULL UNIQUE,
        title JSONB NOT NULL,
        culture_tag VARCHAR(50) NOT NULL,
        city_name JSONB NOT NULL,
        duration JSONB NOT NULL,
        audience JSONB NOT NULL,
        summary JSONB NOT NULL,
        story JSONB NOT NULL,
        cover_image VARCHAR(500) NOT NULL,
        published BOOLEAN NOT NULL DEFAULT false,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_story_routes_slug ON story_routes(slug);
      CREATE INDEX idx_story_routes_published ON story_routes(published);
    `);

    // 5. route_stops
    await queryRunner.query(`
      CREATE TABLE route_stops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id UUID NOT NULL REFERENCES story_routes(id) ON DELETE CASCADE,
        sort_order INT NOT NULL,
        time VARCHAR(20) NOT NULL,
        stop_name JSONB NOT NULL,
        story JSONB NOT NULL,
        cultural_story JSONB NOT NULL,
        details JSONB NOT NULL DEFAULT '[]',
        image VARCHAR(500) NOT NULL,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        meal JSONB,
        hotel JSONB,
        transit JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(route_id, sort_order)
      );
      CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
    `);

    // 6. route_city_links
    await queryRunner.query(`
      CREATE TABLE route_city_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id UUID NOT NULL REFERENCES story_routes(id) ON DELETE CASCADE,
        city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
        sort_order INT DEFAULT 0
      );
      CREATE UNIQUE INDEX idx_rcl_route_city ON route_city_links(route_id, city_id);
      CREATE INDEX idx_rcl_city ON route_city_links(city_id);
      CREATE INDEX idx_rcl_route ON route_city_links(route_id);
    `);

    // 7. store_collections
    await queryRunner.query(`
      CREATE TABLE store_collections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) NOT NULL UNIQUE,
        title JSONB NOT NULL,
        route_name VARCHAR(200) NOT NULL,
        route_slug VARCHAR(100) DEFAULT '',
        image VARCHAR(500) NOT NULL,
        body JSONB NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        published BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_store_collections_slug ON store_collections(slug);
    `);

    // 8. store_products
    await queryRunner.query(`
      CREATE TABLE store_products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(120) NOT NULL UNIQUE,
        name JSONB NOT NULL,
        collection_id UUID REFERENCES store_collections(id) ON DELETE SET NULL,
        price NUMERIC(10, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'SGD',
        tag JSONB NOT NULL,
        image VARCHAR(500) NOT NULL,
        story JSONB NOT NULL,
        material JSONB,
        dimensions JSONB,
        origin JSONB,
        care JSONB,
        origin_trace JSONB,
        gallery JSONB NOT NULL DEFAULT '[]',
        stock INT NOT NULL DEFAULT 0,
        published BOOLEAN NOT NULL DEFAULT false,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_store_products_slug ON store_products(slug);
      CREATE INDEX idx_store_products_collection ON store_products(collection_id);
      CREATE INDEX idx_store_products_published ON store_products(published);
    `);

    // 9. frontend_featured
    await queryRunner.query(`
      CREATE TABLE frontend_featured (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section VARCHAR(60) NOT NULL,
        ref_type VARCHAR(40) NOT NULL,
        ref_id UUID NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX idx_featured_uniq ON frontend_featured(section, ref_type, ref_id);
      CREATE INDEX idx_featured_section ON frontend_featured(section);
    `);

    // 10. interpreting_service_modes
    await queryRunner.query(`
      CREATE TABLE interpreting_service_modes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sort_order INT NOT NULL UNIQUE,
        title JSONB NOT NULL,
        price JSONB NOT NULL,
        best_for JSONB NOT NULL,
        body JSONB NOT NULL,
        includes JSONB NOT NULL DEFAULT '[]',
        accent VARCHAR(10) NOT NULL DEFAULT 'light',
        featured BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_interpreting_service_modes_sort ON interpreting_service_modes(sort_order);
    `);

    // 11. interpreter_profiles
    await queryRunner.query(`
      CREATE TABLE interpreter_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sort_order INT NOT NULL UNIQUE,
        name JSONB NOT NULL,
        language JSONB NOT NULL,
        focus JSONB NOT NULL,
        helps JSONB NOT NULL DEFAULT '[]',
        avatar VARCHAR(500) NOT NULL DEFAULT '',
        bio JSONB,
        status VARCHAR(30) NOT NULL DEFAULT 'pending_review',
        city VARCHAR(120) NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_interpreter_profiles_sort ON interpreter_profiles(sort_order);
    `);

    // 12. interpreting_faqs
    await queryRunner.query(`
      CREATE TABLE interpreting_faqs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sort_order INT NOT NULL UNIQUE,
        question JSONB NOT NULL,
        answer JSONB NOT NULL,
        category VARCHAR(40) NOT NULL DEFAULT 'interpreting',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_interpreting_faqs_sort ON interpreting_faqs(sort_order);
    `);

    // 13. booking_submissions
    await queryRunner.query(`
      CREATE TABLE booking_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        contact VARCHAR(300) NOT NULL,
        city VARCHAR(200) NOT NULL,
        service_date DATE NOT NULL,
        support_mode VARCHAR(200) NOT NULL,
        group_size VARCHAR(100),
        route_or_need TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'new',
        assigned_interpreter_id UUID,
        assigned_interpreter_name VARCHAR(200),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_booking_submissions_status ON booking_submissions(status);
      CREATE INDEX idx_booking_submissions_created ON booking_submissions(created_at DESC);
    `);

    // 14. orders
    await queryRunner.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_no VARCHAR(32) NOT NULL UNIQUE,
        user_id UUID REFERENCES users(id),
        guest_email VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        total_amount NUMERIC(10,2) NOT NULL,
        payment_method VARCHAR(20),
        payment_id VARCHAR(100),
        shipping_addr JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_orders_order_no ON orders(order_no);
      CREATE INDEX idx_orders_status ON orders(status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS orders CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS booking_submissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS interpreting_faqs CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS interpreter_profiles CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS interpreting_service_modes CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS frontend_featured CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS store_products CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS store_collections CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS route_city_links CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS route_stops CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS story_routes CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS city_culture_sections CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS cities CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
  }
}
