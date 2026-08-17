/// <reference types="@cloudflare/workers-types" />
export type Bindings = {
  DB: D1Database
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
  ADMIN_SESSION_SECRET: string
}

export type Variables = {
  adminUser?: {
    id: number
    username: string
  }
}
