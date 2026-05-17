import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly dataSource: DataSource) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCities,
      totalRoutes,
      totalProducts,
      totalInterpreters,
      pendingBookings,
      pendingOrders,
    ] = await Promise.all([
      this.countTable('users'),
      this.countTable('cities', "published = true"),
      this.countTable('story_routes', "published = true"),
      this.countTable('store_products', "published = true"),
      this.countTable('interpreter_profiles'),
      this.countTable("booking_submissions", "status IN ('new', 'pending')"),
      this.countTable('orders', "status = 'pending'"),
    ]);

    const stats = {
      totalUsers,
      totalCities,
      totalRoutes,
      totalProducts,
      totalInterpreters,
      pendingBookings,
      pendingOrders,
    };

    const orderTrend = await this.getOrderTrend();
    const bookingModeDist = await this.getBookingModeDistribution();
    const topCities = await this.getTopCities();

    return { stats, orderTrend, bookingModeDist, topCities };
  }

  private async countTable(table: string, where?: string): Promise<number> {
    try {
      const sql = where
        ? `SELECT COUNT(*)::int AS count FROM ${table} WHERE ${where}`
        : `SELECT COUNT(*)::int AS count FROM ${table}`;
      const rows = await this.dataSource.query(sql);
      return rows[0]?.count ?? 0;
    } catch (err: any) {
      this.logger.warn(`Failed to count ${table}: ${err.message}`);
      return 0;
    }
  }

  private async getOrderTrend() {
    try {
      const rows = await this.dataSource.query(`
        SELECT
          to_char(d.date, 'YYYY-MM-DD') AS date,
          COALESCE(SUM(o.total_amount), 0) AS amount,
          COUNT(o.id)::int AS count
        FROM generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          '1 day'::interval
        ) AS d(date)
        LEFT JOIN orders o ON o.created_at::date = d.date
        GROUP BY d.date
        ORDER BY d.date
      `);

      return rows.map((r: any) => ({
        date: r.date,
        amount: Math.round(parseFloat(r.amount || '0') * 100) / 100,
        count: r.count,
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to get order trend: ${err.message}`);
      return [];
    }
  }

  private async getBookingModeDistribution() {
    try {
      const rows = await this.dataSource.query(`
        SELECT
          COALESCE(support_mode, 'unknown') AS mode,
          COUNT(*)::int AS count
        FROM booking_submissions
        GROUP BY support_mode
        ORDER BY count DESC
      `);

      const total = rows.reduce((sum: number, r: any) => sum + r.count, 0);

      return rows.map((r: any) => ({
        mode: r.mode,
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to get booking mode dist: ${err.message}`);
      return [];
    }
  }

  private async getTopCities() {
    try {
      const rows = await this.dataSource.query(`
        SELECT
          c.name->>'en' AS city,
          c.slug AS "citySlug",
          COUNT(rcl.route_id)::int AS "routeCount"
        FROM cities c
        INNER JOIN route_city_links rcl ON rcl.city_id = c.id
        WHERE c.published = true
        GROUP BY c.id, c.name, c.slug
        ORDER BY "routeCount" DESC
        LIMIT 5
      `);

      // Booking count — booking_submissions stores city name string in 'city' column
      const bookingCounts = await this.dataSource.query(`
        SELECT
          b.city,
          COUNT(*)::int AS count
        FROM booking_submissions b
        INNER JOIN cities c ON c.name->>'en' = b.city
        WHERE b.city IS NOT NULL
        GROUP BY b.city, c.slug
      `);

      const bookingMap = new Map<string, number>();
      for (const b of bookingCounts) {
        bookingMap.set(b.city, b.count);
      }

      return rows.map((r: any) => {
        // Match booking count by city name
        const bc = bookingCounts.find((b: any) => b.city === r.city);
        return {
          city: r.city,
          citySlug: r.citySlug,
          routeCount: r.routeCount,
          bookingCount: bc?.count ?? 0,
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to get top cities: ${err.message}`);
      return [];
    }
  }
}
