/*
  # Create estimates table with trigger and policies

  1. New Tables
    - `estimates` table with project data and costs
  2. Functions & Triggers
    - Add updated_at trigger
  3. Security
    - Enable RLS
    - Add policies for authenticated and anonymous users
*/

-- Create the estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectInfo" jsonb NOT NULL,
  "structuralSteel" jsonb NOT NULL,
  "metalDeck" jsonb NOT NULL,
  "miscellaneousSteel" jsonb NOT NULL,
  remarks text,
  "totalCost" numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create the function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_estimates_updated_at ON public.estimates;

-- Create the trigger
CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read estimates" ON public.estimates;
DROP POLICY IF EXISTS "Allow authenticated users to insert estimates" ON public.estimates;
DROP POLICY IF EXISTS "Allow authenticated users to update estimates" ON public.estimates;
DROP POLICY IF EXISTS "Allow authenticated users to delete estimates" ON public.estimates;
DROP POLICY IF EXISTS "Anon users can read all estimates" ON public.estimates;
DROP POLICY IF EXISTS "Anon users can create estimates" ON public.estimates;
DROP POLICY IF EXISTS "Anon users can update estimates" ON public.estimates;
DROP POLICY IF EXISTS "Anon users can delete estimates" ON public.estimates;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read estimates"
  ON public.estimates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert estimates"
  ON public.estimates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update estimates"
  ON public.estimates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete estimates"
  ON public.estimates
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for anonymous users
CREATE POLICY "Anon users can read all estimates"
  ON public.estimates
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can create estimates"
  ON public.estimates
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update estimates"
  ON public.estimates
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete estimates"
  ON public.estimates
  FOR DELETE
  TO anon
  USING (true);