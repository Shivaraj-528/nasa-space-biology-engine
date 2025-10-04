-- Initialize PostgreSQL schema for NASA Space Biology Engine
-- This is a minimal placeholder schema. Extend with real tables and indexes.

CREATE SCHEMA IF NOT EXISTS nsbe;
SET search_path TO nsbe,public;

-- Users table (for demo; real system would integrate NASA Login/OAuth2)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'researcher',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Experiments (structured metadata)
CREATE TABLE IF NOT EXISTS experiments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organism TEXT NOT NULL,
    mission TEXT NOT NULL,
    type TEXT NOT NULL,
    duration_days INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable pgcrypto for gen_random_uuid if not already
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create extension pgcrypto (may already exist or permissions missing)';
END $$;
