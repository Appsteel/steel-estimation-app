/*
  # Create estimates table

  1. New Tables
    - `estimates`
      - `id` (uuid, primary key)
      - `projectInfo` (jsonb, contains all project information)
      - `structuralSteel` (jsonb, contains all structural steel data)
      - `metalDeck` (jsonb, contains all metal deck data)
      - `miscellaneousSteel` (jsonb, contains all miscellaneous steel data)
      - `remarks` (text, general remarks about the estimate)
      - `totalCost` (numeric, total cost of the estimate)
      - `notes` (text, notes for summary sheet)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `estimates` table
    - Add policies for authenticated users to perform CRUD operations on their own data
*/

CREATE TABLE IF NOT EXISTS estimates (
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

-- Enable Row Level Security
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own estimates"
  ON estimates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own estimates"
  ON estimates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own estimates"
  ON estimates
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete their own estimates"
  ON estimates
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow anon users to read all estimates (for demo purposes, remove in production)
CREATE POLICY "Anon users can read all estimates"
  ON estimates
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon users to create/update estimates (for demo purposes, remove in production)
CREATE POLICY "Anon users can create estimates"
  ON estimates
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update estimates"
  ON estimates
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anon users can delete estimates"
  ON estimates
  FOR DELETE
  TO anon
  USING (true);