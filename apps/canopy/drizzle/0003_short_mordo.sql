CREATE TABLE IF NOT EXISTS "api_key" (
  "id" text PRIMARY KEY,
  "site_id" text NOT NULL REFERENCES "site"(id) ON DELETE CASCADE,
  "name" text NOT NULL,
  "key_hash" text NOT NULL,
  "created_at" timestore(2) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "api_key_site_idx" ON "api_key" ("site_id");
CREATE UNIQUE INDEX IF NOT EXISTS "api_key_site_name_idx" ON "api_key" ("site_id", "name");
