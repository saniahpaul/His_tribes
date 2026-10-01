-- his_tribes PostgreSQL schema
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'youth' CHECK (role IN ('youth','leader')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_reading_day UNIQUE(user_id, reading_date)
);
CREATE INDEX IF NOT EXISTS idx_reading_user_date ON reading_records(user_id, reading_date);

CREATE TABLE IF NOT EXISTS soap_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scripture TEXT NOT NULL,
  observation TEXT NOT NULL,
  application TEXT NOT NULL,
  prayer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_soap_user ON soap_entries(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Answered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prayer_reactions (
  id SERIAL PRIMARY KEY,
  prayer_id INTEGER NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_prayer_user UNIQUE(prayer_id, user_id)
);

CREATE TABLE IF NOT EXISTS monthly_goals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  target_days INTEGER NOT NULL CHECK (target_days BETWEEN 1 AND 31),
  deadline DATE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
