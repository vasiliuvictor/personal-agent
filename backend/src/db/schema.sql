-- AgentScout Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension (already on by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for search frequency
CREATE TYPE search_frequency AS ENUM ('hourly', 'daily', 'weekly');

-- Agents table
CREATE TABLE agents (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  keywords           TEXT[] NOT NULL,
  search_frequency   search_frequency NOT NULL DEFAULT 'daily',
  notification_email BOOLEAN NOT NULL DEFAULT FALSE,
  last_run_at        TIMESTAMPTZ,
  next_run_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insights table
CREATE TABLE insights (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id     UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary      TEXT NOT NULL,
  sources      JSONB NOT NULL DEFAULT '[]'::JSONB,
  search_query TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users only access their own rows
CREATE POLICY "agents_owner_access" ON agents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "insights_owner_access" ON insights
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_agents_next_run_at ON agents(next_run_at);
CREATE INDEX idx_insights_user_id_created_at ON insights(user_id, created_at DESC);
CREATE INDEX idx_insights_agent_id ON insights(agent_id);
