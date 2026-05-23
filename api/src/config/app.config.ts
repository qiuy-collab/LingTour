export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiration: process.env.JWT_EXPIRATION ?? '24h',
  },
  upload: {
    dir: process.env.UPLOAD_DIR ?? './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10),
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
});
