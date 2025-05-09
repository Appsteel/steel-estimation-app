export interface ProjectInfo {
  quoteNumber: string;
  date: string;
  gcName: string;
  gcAddress: string;
  projectName: string;
  projectAddress: string;
  estimator: string;
  closingDate: string;
  contactPerson: string;
  contactPhone: string;
  architect: string;
  architectPhone: string;
  engineer: string;
  engineerPhone: string;
  structuralDrawings: string;
  structuralDrawingsDate: string;
  structuralDrawingsRevision: string;
  architecturalDrawings: string;
  architecturalDrawingsDate: string;
  architecturalDrawingsRevision: string;
}

export interface MaterialItem {
  id: string;
  description: string;
  weight: number;
  unitRate: number;
  totalCost: number;
}

export interface LabourItem {
  id: string;
  memberGroup: string;
  totalPcs: number;
  pcsPerDay: number;
  hours: number;
  hourlyRate: number;
  totalCost: number;
}

export interface MiscellaneousItem {
  id: string;
  type: 'S/O' | 'S/I';
  description: string;
  unit: number;
  unitRate: number;
  totalCost: number;
  refDrawing?: string;
}

export interface StructuralSteelData {
  visible: boolean;
  area: number;
  weight: number;
  connectionAllowance: number;
  totalWeight: number;
  totalTons: number;
  pricePerTon: number; // New reference field
  pricePerSqft: number; // New reference field
  
  material: MaterialItem[];
  materialCost: number;
  
  shopLabour: LabourItem[];
  shopLabourCost: number;
  hoursPerTon: number; // New reference field
  
  owsj: {
    supplier: string;
    pcs: number;
    weight: number;
    pricePerWeight: number;
    cost: number;
  };
  
  engineeringDrafting: {
    engineering: number;
    draftingTons: number;
    draftingPricePerTon: number;
    draftingCost: number;
    totalCost: number;
  };
  
  erectionFreight: {
    erector: string;
    tons: number; // This will now include OWSJ weight
    pricePerTon: number;
    premium: number;
    erectionCost: number;
    regularTrips: number;
    regularTripCost: number;
    trailerTrips: number;
    trailerTripCost: number;
    freightCost: number;
    totalCost: number;
  };
  
  overheadProfit: {
    overhead: number;
    profit: number;
    totalPercentage: number;
  };
  
  totalCost: number;
  overriddenTotalCost?: number;
}

export interface MetalDeckData {
  visible: boolean;
  area: number;
  costPerSqft: number;
  deckCost: number; // New field for manual deck cost
  erection: {
    area: number; // New field for erection area
    pricePerSqft: number; // New field for erection price per sqft
    totalCost: number; // New field for erection total cost
  };
  totalCost: number;
  overriddenTotalCost?: number;
}

export interface MiscellaneousSteelData {
  visible: boolean;
  items: MiscellaneousItem[];
  totalCost: number;
  overriddenTotalCost?: number;
}

export interface EstimateData {
  id?: string;
  projectInfo: ProjectInfo;
  structuralSteel: StructuralSteelData;
  metalDeck: MetalDeckData;
  miscellaneousSteel: MiscellaneousSteelData;
  remarks: string;
  totalCost: number;
  
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

export interface QuotationLetterData {
  id?: string;
  estimateId: string;
  description: string;
  additionalDescription: string;
  items: MiscellaneousItem[];
  created_at?: string;
  updated_at?: string;
}
