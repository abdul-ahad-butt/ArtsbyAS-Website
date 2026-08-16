export type Bindings = {
  DB: D1Database
  R2_ASSETS: R2Bucket
  ADMIN_SESSION_SECRET: string
  R2_SIGNING_SECRET: string
}

export type Variables = {
  adminUser?: {
    id: number
    username: string
  }
}
