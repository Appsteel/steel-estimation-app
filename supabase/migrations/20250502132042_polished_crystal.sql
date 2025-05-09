/*
  # Update steel estimation schema

  1. Changes
    - Add comments to clarify column purposes
    - Update existing JSONB structure documentation
  2. Security
    - No changes to RLS policies needed
*/

-- Add or update column comments
COMMENT ON COLUMN public.estimates."structuralSteel" IS 'Contains structural steel details including:
- Basic measurements (area, weight, connection allowance)
- Price references (price per ton, price per sqft)
- Material costs and items
- Shop labour with hours per ton reference
- OWSJ details
- Engineering and drafting costs
- Erection and freight costs (including OWSJ weight)
- Overhead and profit calculations';

COMMENT ON COLUMN public.estimates."metalDeck" IS 'Contains metal deck details including:
- Area measurements
- Cost calculations
- Deck material cost
- Erection details (area, price per sqft, total cost)
- Total cost calculations';

COMMENT ON COLUMN public.estimates."miscellaneousSteel" IS 'Contains miscellaneous steel items with:
- Item details (type, description, unit, rate)
- Cost calculations
- Reference drawings';

-- No structural changes needed as we're using JSONB columns
-- The new fields will be handled within the existing JSONB structure