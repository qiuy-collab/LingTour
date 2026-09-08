import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

function context(request: Record<string, unknown>): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard cookie authentication', () => {
  const reflector = { getAllAndOverride: jest.fn(() => false) };
  const config = { get: jest.fn(() => 'http://localhost:3100') };
  const jwt = { verifyAsync: jest.fn(async () => ({ sub: 'user-1', email: 'user@example.com', role: 'traveler' })) };
  const guard = new JwtAuthGuard(jwt as never, reflector as never, config as never);

  beforeEach(() => {
    jest.clearAllMocks();
    jwt.verifyAsync.mockResolvedValue({ sub: 'user-1', email: 'user@example.com', role: 'traveler' });
  });

  it('accepts a valid cookie for reads', async () => {
    const request = { method: 'GET', headers: { cookie: 'lingtour_session=token' } };
    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    expect(request.user).toMatchObject({ sub: 'user-1' });
  });

  it('prefers a bearer token over a cookie', async () => {
    const request = { method: 'GET', headers: { authorization: 'Bearer bearer', cookie: 'lingtour_session=cookie' } };
    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    expect(jwt.verifyAsync).toHaveBeenCalledWith('bearer', expect.anything());
  });

  it('rejects malformed encoded cookies as 401 rather than 500', async () => {
    const request = { method: 'GET', headers: { cookie: 'lingtour_session=%E0%A4%A' } };
    await expect(guard.canActivate(context(request))).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects cross-origin cookie mutations', async () => {
    const request = { method: 'POST', protocol: 'http', headers: { origin: 'http://evil.example', host: 'localhost:8000', cookie: 'lingtour_session=token' } };
    await expect(guard.canActivate(context(request))).rejects.toThrow('Cross-origin');
  });

  it('requires Origin on cookie mutations', async () => {
    const request = { method: 'PATCH', protocol: 'http', headers: { host: 'localhost:8000', cookie: 'lingtour_session=token' } };
    await expect(guard.canActivate(context(request))).rejects.toThrow('Missing Origin');
  });
});
