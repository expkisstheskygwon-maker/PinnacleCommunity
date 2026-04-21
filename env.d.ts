interface CloudflareEnv {
  DB: D1Database;
}

declare namespace NodeJS {
  interface ProcessEnv extends CloudflareEnv {}
}
