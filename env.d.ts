interface CloudflareEnv {
  DB: D1Database;
  BUCKET: R2Bucket;
}

declare namespace NodeJS {
  interface ProcessEnv extends CloudflareEnv {}
}
