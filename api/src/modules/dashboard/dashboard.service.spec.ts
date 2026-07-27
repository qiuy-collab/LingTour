import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('counts travelers only for the user total shown by user management', async () => {
    const dataSource = {
      query: jest.fn(async (sql: string) => {
        if (sql.includes('generate_series')) return [];
        if (sql.includes('support_mode')) return [];
        if (sql.includes('route_city_links')) return [];
        if (sql.includes('booking_submissions b')) return [];
        return [{ count: 0 }];
      }),
    };
    const service = new DashboardService(dataSource as any);

    await service.getDashboardStats();

    expect(dataSource.query).toHaveBeenCalledWith(
      'SELECT COUNT(*)::int AS count FROM "users" WHERE role = \'traveler\'',
    );
  });
});
