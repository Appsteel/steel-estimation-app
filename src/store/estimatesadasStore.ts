import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { 
  EstimateData, 
  MaterialItem, 
  LabourItem, 
  MiscellaneousItem 
} from '../types/estimate';

// Helper functions
const calculateTotalWeight = (weight: number, connectionAllowance: number) => {
  return weight * (1 + connectionAllowance / 100);
};

const calculateTotalTons = (totalWeight: number) => {
  return totalWeight / 2000;
};

const calculateMaterialCost = (material: MaterialItem[]) => {
  return Math.ceil(material.reduce((sum, item) => sum + (item.totalCost || 0), 0));
};

const calculateLabourCost = (labour: LabourItem[]) => {
  return Math.ceil(labour.reduce((sum, item) => sum + (item.totalCost || 0), 0));
};

const calculateMiscellaneousCost = (items: MiscellaneousItem[]) => {
  return Math.ceil(items.reduce((sum, item) => sum + (item.totalCost || 0), 0));
};

const generateQuoteNumber = () => {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const number = Math.floor(Math.random() * 99) + 1;
  return `${yy}${mm}-${number.toString().padStart(2, '0')}`;
};

const getDefaultMaterialItems = (): MaterialItem[] => [
  { id: uuidv4(), description: 'First Weight', weight: 0, unitRate: 0, totalCost: 0 },
  { id: uuidv4(), description: 'HSS (All)', weight: 0, unitRate: 0, totalCost: 0 },
  { id: uuidv4(), description: 'HSS (7" & 8")', weight: 0, unitRate: 0, totalCost: 0 },
  { id: uuidv4(), description: 'Channel Premium', weight: 0, unitRate: 0, totalCost: 0 },
  { id: uuidv4(), description: 'Plate Premium (3/4" & Higher)', weight: 0, unitRate: 0, totalCost: 0 },
];

const getDefaultLabourItems = (): LabourItem[] => [
  { id: uuidv4(), memberGroup: 'Column', totalPcs: 0, pcsPerDay: 0, hours: 0, hourlyRate: 85, totalCost: 0 },
  { id: uuidv4(), memberGroup: 'Beam', totalPcs: 0, pcsPerDay: 0, hours: 0, hourlyRate: 85, totalCost: 0 },
  { id: uuidv4(), memberGroup: 'Brace', totalPcs: 0, pcsPerDay: 0, hours: 0, hourlyRate: 85, totalCost: 0 },
  { id: uuidv4(), memberGroup: 'Girts', totalPcs: 0, pcsPerDay: 0, hours: 0, hourlyRate: 85, totalCost: 0 },
  { id: uuidv4(), memberGroup: 'VBF', totalPcs: 0, pcsPerDay: 0, hours: 0, hourlyRate: 85, totalCost: 0 },
];

const getDefaultMiscellaneousItems = (): MiscellaneousItem[] => [
  { id: uuidv4(), type: 'S/O', description: 'Bent Plate Frame for Drive in Door (8\' x 8\')', unit: 0, unitRate: 0, totalCost: 0 },
  { id: uuidv4(), type: 'S/O', description: 'Roof Hatch Ladder with Cage x 18\' high', unit: 0, unitRate: 0, totalCost: 0 },
  { id: uuidv4(), type: 'S/O', description: 'Shop drawings', unit: 0, unitRate: 0, totalCost: 0 },
  { id: uuidv4(), type: 'S/O', description: 'Stamp', unit: 0, unitRate: 0, totalCost: 0 },
];

const getDefaultEstimate = (): EstimateData => ({
  projectInfo: {
    quoteNumber: generateQuoteNumber(),
    date: format(new Date(), 'yyyy-MM-dd'),
    gcName: '',
    gcAddress: '',
    projectName: '',
    projectAddress: '',
    estimator: '',
    closingDate: '',
    contactPerson: '',
    contactPhone: '',
    architect: '',
    architectPhone: '',
    engineer: '',
    engineerPhone: '',
    structuralDrawings: '',
    structuralDrawingsDate: '',
    structuralDrawingsRevision: '',
    architecturalDrawings: '',
    architecturalDrawingsDate: '',
    architecturalDrawingsRevision: '',
  },
  structuralSteel: {
    visible: true,
    area: 0,
    weight: 0,
    connectionAllowance: 5,
    totalWeight: 0,
    totalTons: 0,
    material: getDefaultMaterialItems(),
    materialCost: 0,
    shopLabour: getDefaultLabourItems(),
    shopLabourCost: 0,
    owsj: {
      supplier: '',
      pcs: 0,
      weight: 0,
      pricePerWeight: 0,
      cost: 0,
    },
    engineeringDrafting: {
      engineering: 0,
      draftingTons: 0,
      draftingPricePerTon: 0,
      draftingCost: 0,
      totalCost: 0,
    },
    erectionFreight: {
      erector: '',
      tons: 0,
      pricePerTon: 0,
      premium: 0,
      erectionCost: 0,
      regularTrips: 0,
      regularTripCost: 300,
      trailerTrips: 0,
      trailerTripCost: 600,
      freightCost: 0,
      totalCost: 0,
    },
    overheadProfit: {
      overhead: 5,
      profit: 10,
      totalPercentage: 15,
    },
    totalCost: 0,
    overriddenTotalCost: undefined,
  },
  metalDeck: {
    visible: true,
    area: 0,
    costPerSqft: 0,
    totalCost: 0,
    overriddenTotalCost: undefined,
  },
  miscellaneousSteel: {
    visible: true,
    items: getDefaultMiscellaneousItems(),
    totalCost: 0,
    overriddenTotalCost: undefined,
  },
  remarks: '',
  totalCost: 0,
});

interface EstimateStore {
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
  
  currentEstimate: EstimateData;
  allEstimates: EstimateData[];
  
  resetEstimate: () => void;
  loadEstimate: (estimate: EstimateData) => void;
  loadAllEstimates: (estimates: EstimateData[]) => void;
  updateProjectInfo: (field: keyof ProjectInfo, value: string) => void;
  toggleStructuralSteelVisibility: () => void;
  updateStructuralSteelField: (field: keyof Omit<StructuralSteelData, 'material' | 'shopLabour' | 'owsj' | 'engineeringDrafting' | 'erectionFreight' | 'overheadProfit' | 'visible' | 'totalWeight' | 'totalTons' | 'materialCost' | 'shopLabourCost' | 'totalCost'>, value: number) => void;
  addMaterialItem: () => void;
  updateMaterialItem: (id: string, field: keyof Omit<MaterialItem, 'id' | 'totalCost'>, value: string | number) => void;
  removeMaterialItem: (id: string) => void;
  addLabourItem: () => void;
  updateLabourItem: (id: string, field: keyof Omit<LabourItem, 'id' | 'hours' | 'totalCost'>, value: string | number) => void;
  removeLabourItem: (id: string) => void;
  updateOWSJField: (field: keyof Omit<StructuralSteelData['owsj'], 'cost'>, value: string | number) => void;
  updateEngineeringDraftingField: (field: keyof Omit<StructuralSteelData['engineeringDrafting'], 'draftingCost' | 'totalCost'>, value: number) => void;
  updateErectionFreightField: (field: keyof Omit<StructuralSteelData['erectionFreight'], 'erectionCost' | 'freightCost' | 'totalCost'>, value: string | number) => void;
  updateOverheadProfitField: (field: keyof Omit<StructuralSteelData['overheadProfit'], 'totalPercentage'>, value: number) => void;
  toggleMetalDeckVisibility: () => void;
  updateMetalDeckField: (field: keyof Omit<MetalDeckData, 'visible' | 'totalCost'>, value: number) => void;
  toggleMiscellaneousSteelVisibility: () => void;
  addMiscellaneousItem: () => void;
  updateMiscellaneousItem: (id: string, field: keyof Omit<MiscellaneousItem, 'id' | 'totalCost'>, value: string | number) => void;
  removeMiscellaneousItem: (id: string) => void;
  updateRemarks: (remarks: string) => void;
  updateStructuralSteelOverride: (value: number | undefined) => void;
  updateMetalDeckOverride: (value: number | undefined) => void;
  updateMiscellaneousSteelOverride: (value: number | undefined) => void;
  recalculateAll: () => void;
}

export const useEstimateStore = create<EstimateStore>((set, get) => ({
  initialized: false,
  setInitialized: (initialized) => set({ initialized }),
  
  currentEstimate: getDefaultEstimate(),
  allEstimates: [],
  
  resetEstimate: () => set({ currentEstimate: getDefaultEstimate() }),
  
  loadEstimate: (estimate) => set({ currentEstimate: estimate }),
  
  loadAllEstimates: (estimates) => set({ allEstimates: estimates }),
  
  updateProjectInfo: (field, value) => {
    set((state) => ({
      currentEstimate: {
        ...state.currentEstimate,
        projectInfo: {
          ...state.currentEstimate.projectInfo,
          [field]: value,
        },
      },
    }));
  },
  
  toggleStructuralSteelVisibility: () => {
    set((state) => {
      const visible = !state.currentEstimate.structuralSteel.visible;
      const updatedEstimate = {
        ...state.currentEstimate,
        structuralSteel: {
          ...state.currentEstimate.structuralSteel,
          visible,
        }
      };
      
      const structuralSteelCost = visible ? state.currentEstimate.structuralSteel.totalCost : 0;
      const metalDeckCost = state.currentEstimate.metalDeck.visible ? state.currentEstimate.metalDeck.totalCost : 0;
      const miscellaneousSteelCost = state.currentEstimate.miscellaneousSteel.visible ? state.currentEstimate.miscellaneousSteel.totalCost : 0;
      
      updatedEstimate.totalCost = structuralSteelCost + metalDeckCost + miscellaneousSteelCost;
      
      return { currentEstimate: updatedEstimate };
    });
  },
  
  updateStructuralSteelField: (field, value) => {
    set((state) => {
      const updatedStructuralSteel = { ...state.currentEstimate.structuralSteel };
      updatedStructuralSteel[field] = value;
      
      if (field === 'weight' || field === 'connectionAllowance') {
        updatedStructuralSteel.totalWeight = calculateTotalWeight(
          field === 'weight' ? value as number : updatedStructuralSteel.weight,
          field === 'connectionAllowance' ? value as number : updatedStructuralSteel.connectionAllowance
        );
        updatedStructuralSteel.totalTons = calculateTotalTons(updatedStructuralSteel.totalWeight);
        
        const updatedMaterial = [...updatedStructuralSteel.material];
        if (updatedMaterial.length > 0) {
          updatedMaterial[0] = {
            ...updatedMaterial[0],
            weight: updatedStructuralSteel.totalWeight,
            totalCost: Math.ceil(updatedStructuralSteel.totalWeight * updatedMaterial[0].unitRate)
          };
        }
        updatedStructuralSteel.material = updatedMaterial;
        updatedStructuralSteel.materialCost = calculateMaterialCost(updatedMaterial);
        
        updatedStructuralSteel.engineeringDrafting.draftingTons = updatedStructuralSteel.totalTons;
        updatedStructuralSteel.engineeringDrafting.draftingCost = Math.ceil(
          updatedStructuralSteel.engineeringDrafting.draftingTons * 
          updatedStructuralSteel.engineeringDrafting.draftingPricePerTon
        );
        updatedStructuralSteel.engineeringDrafting.totalCost = Math.ceil(
          updatedStructuralSteel.engineeringDrafting.engineering + 
          updatedStructuralSteel.engineeringDrafting.draftingCost
        );
        
        updatedStructuralSteel.erectionFreight.tons = updatedStructuralSteel.totalTons;
        updatedStructuralSteel.erectionFreight.erectionCost = Math.ceil(
          (updatedStructuralSteel.erectionFreight.tons * updatedStructuralSteel.erectionFreight.pricePerTon) + 
          updatedStructuralSteel.erectionFreight.premium
        );
        
        updatedStructuralSteel.erectionFreight.trailerTrips = Math.ceil(updatedStructuralSteel.totalTons / 20);
        updatedStructuralSteel.erectionFreight.freightCost = Math.ceil(
          (updatedStructuralSteel.erectionFreight.regularTrips * updatedStructuralSteel.erectionFreight.regularTripCost) + 
          (updatedStructuralSteel.erectionFreight.trailerTrips * updatedStructuralSteel.erectionFreight.trailerTripCost)
        );
        updatedStructuralSteel.erectionFreight.totalCost = Math.ceil(
          updatedStructuralSteel.erectionFreight.erectionCost + 
          updatedStructuralSteel.erectionFreight.freightCost
        );
      }
      
      if (field === 'area') {
        const updatedMetalDeck = { ...state.currentEstimate.metalDeck, area: value as number };
        updatedMetalDeck.totalCost = Math.ceil(updatedMetalDeck.area * updatedMetalDeck.costPerSqft);
        
        const updatedEstimate = {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel,
          metalDeck: updatedMetalDeck
        };
        
        get().recalculateAll();
        
        return { currentEstimate: updatedEstimate };
      }
      
      const updatedEstimate = {
        ...state.currentEstimate,
        structuralSteel: updatedStructuralSteel
      };
      
      get().recalculateAll();
      
      return { currentEstimate: updatedEstimate };
    });
  },
  
  addMaterialItem: () => {
    set((state) => {
      const newItem: MaterialItem = {
        id: uuidv4(),
        description: '',
        weight: 0,
        unitRate: 0,
        totalCost: 0
      };
      
      const updatedMaterial = [...state.currentEstimate.structuralSteel.material, newItem];
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        material: updatedMaterial,
        materialCost: calculateMaterialCost(updatedMaterial)
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  updateMaterialItem: (id, field, value) => {
    set((state) => {
      const updatedMaterial = state.currentEstimate.structuralSteel.material.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          updatedItem.totalCost = Math.ceil(updatedItem.weight * updatedItem.unitRate);
          return updatedItem;
        }
        return item;
      });
      
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        material: updatedMaterial,
        materialCost: calculateMaterialCost(updatedMaterial)
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  removeMaterialItem: (id) => {
    set((state) => {
      const updatedMaterial = state.currentEstimate.structuralSteel.material.filter(item => item.id !== id);
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        material: updatedMaterial,
        materialCost: calculateMaterialCost(updatedMaterial)
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  addLabourItem: () => {
    set((state) => {
      const newItem: LabourItem = {
        id: uuidv4(),
        memberGroup: '',
        totalPcs: 0,
        pcsPerDay: 0,
        hours: 0,
        hourlyRate: 85,
        totalCost: 0
      };
      
      const updatedLabour = [...state.currentEstimate.structuralSteel.shopLabour, newItem];
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        shopLabour: updatedLabour,
        shopLabourCost: calculateLabourCost(updatedLabour)
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  updateLabourItem: (id, field, value) => {
    set((state) => {
      const updatedLabour = state.currentEstimate.structuralSteel.shopLabour.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          updatedItem.hours = Math.ceil(updatedItem.totalPcs / updatedItem.pcsPerDay * 100);
          updatedItem.totalCost = Math.ceil(updatedItem.hours * updatedItem.hourlyRate);
          return updatedItem;
        }
        return item;
      });
      
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        shopLabour: updatedLabour,
        shopLabourCost: calculateLabourCost(updatedLabour)
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  removeLabourItem: (id) => {
    set((state) => {
      const updatedLabour = state.currentEstimate.structuralSteel.shopLabour.filter(item => item.id !== id);
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        shopLabour: updatedLabour,
        shopLabourCost: calculateLabourCost(updatedLabour)
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  updateOWSJField: (field, value) => {
    set((state) => {
      const updatedOWSJ = { ...state.currentEstimate.structuralSteel.owsj, [field]: value };
      
      if (field === 'weight' || field === 'pricePerWeight') {
        updatedOWSJ.cost = Math.ceil(updatedOWSJ.weight * updatedOWSJ.pricePerWeight);
      }
      
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        owsj: updatedOWSJ
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  updateEngineeringDraftingField: (field, value) => {
    set((state) => {
      const updatedEngineeringDrafting = {
        ...state.currentEstimate.structuralSteel.engineeringDrafting,
        [field]: value
      };
      
      updatedEngineeringDrafting.draftingCost = Math.ceil(
        updatedEngineeringDrafting.draftingTons * 
        updatedEngineeringDrafting.draftingPricePerTon
      );
      
      updatedEngineeringDrafting.totalCost = Math.ceil(
        updatedEngineeringDrafting.engineering + 
        updatedEngineeringDrafting.draftingCost
      );
      
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        engineeringDrafting: updatedEngineeringDrafting
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  updateErectionFreightField: (field, value) => {
    set((state) => {
      const updatedErectionFreight = {
        ...state.currentEstimate.structuralSteel.erectionFreight,
        [field]: value
      };
      
      updatedErectionFreight.erectionCost = Math.ceil(
        (updatedErectionFreight.tons * updatedErectionFreight.pricePerTon) + 
        updatedErectionFreight.premium
      );
      
      updatedErectionFreight.freightCost = Math.ceil(
        (updatedErectionFreight.regularTrips * updatedErectionFreight.regularTripCost) + 
        (updatedErectionFreight.trailerTrips * updatedErectionFreight.trailerTripCost)
      );
      
      updatedErectionFreight.totalCost = Math.ceil(
        updatedErectionFreight.erectionCost + 
        updatedErectionFreight.freightCost
      );
      
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        erectionFreight: updatedErectionFreight
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  updateOverheadProfitField: (field, value) => {
    set((state) => {
      const updatedOverheadProfit = {
        ...state.currentEstimate.structuralSteel.overheadProfit,
        [field]: value
      };
      
      updatedOverheadProfit.totalPercentage = 
        updatedOverheadProfit.overhead + 
        updatedOverheadProfit.profit;
      
      const updatedStructuralSteel = {
        ...state.currentEstimate.structuralSteel,
        overheadProfit: updatedOverheadProfit
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          structuralSteel: updatedStructuralSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  toggleMetalDeckVisibility: () => {
    set((state) => {
      const visible = !state.currentEstimate.metalDeck.visible;
      const updatedEstimate = {
        ...state.currentEstimate,
        metalDeck: {
          ...state.currentEstimate.metalDeck,
          visible,
        }
      };
      
      const structuralSteelCost = state.currentEstimate.structuralSteel.visible ? state.currentEstimate.structuralSteel.totalCost : 0;
      const metalDeckCost = visible ? state.currentEstimate.metalDeck.totalCost : 0;
      const miscellaneousSteelCost = state.currentEstimate.miscellaneousSteel.visible ? state.currentEstimate.miscellaneousSteel.totalCost : 0;
      
      updatedEstimate.totalCost = structuralSteelCost + metalDeckCost + miscellaneousSteelCost;
      
      return { currentEstimate: updatedEstimate };
    });
  },
  
  updateMetalDeckField: (field, value) => {
    set((state) => {
      const updatedMetalDeck = { ...state.currentEstimate.metalDeck, [field]: value };
      updatedMetalDeck.totalCost = Math.ceil(updatedMetalDeck.area * updatedMetalDeck.costPerSqft);
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          metalDeck: updatedMetalDeck
        }
      };
    });
    
    get().recalculateAll();
  },
  
  toggleMiscellaneousSteelVisibility: () => {
    set((state) => {
      const visible = !state.currentEstimate.miscellaneousSteel.visible;
      const updatedEstimate = {
        ...state.currentEstimate,
        miscellaneousSteel: {
          ...state.currentEstimate.miscellaneousSteel,
          visible,
        }
      };
      
      const structuralSteelCost = state.currentEstimate.structuralSteel.visible ? state.currentEstimate.structuralSteel.totalCost : 0;
      const metalDeckCost = state.currentEstimate.metalDeck.visible ? state.currentEstimate.metalDeck.totalCost : 0;
      const miscellaneousSteelCost = visible ? state.currentEstimate.miscellaneousSteel.totalCost : 0;
      
      updatedEstimate.totalCost = structuralSteelCost + metalDeckCost + miscellaneousSteelCost;
      
      return { currentEstimate: updatedEstimate };
    });
  },
  
  addMiscellaneousItem: () => {
    set((state) => {
      const newItem: MiscellaneousItem = {
        id: uuidv4(),
        type: 'S/O',
        description: '',
        unit: 0,
        unitRate: 0,
        totalCost: 0
      };
      
      const updatedItems = [...state.currentEstimate.miscellaneousSteel.items, newItem];
      const updatedMiscellaneousSteel = {
        ...state.currentEstimate.miscellaneousSteel,
        items: updatedItems,
        totalCost: calculateMiscellaneousCost(updatedItems)
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          miscellaneousSteel: updatedMiscellaneousSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  updateMiscellaneousItem: (id, field, value) => {
    set((state) => {
      const updatedItems = state.currentEstimate.miscellaneousSteel.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          updatedItem.totalCost = Math.ceil(updatedItem.unit * updatedItem.unitRate);
          return updatedItem;
        }
        return item;
      });
      
      const updatedMiscellaneousSteel = {
        ...state.currentEstimate.miscellaneousSteel,
        items: updatedItems,
        totalCost: calculateMiscellaneousCost(updatedItems)
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          miscellaneousSteel: updatedMiscellaneousSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  removeMiscellaneousItem: (id) => {
    set((state) => {
      const updatedItems = state.currentEstimate.miscellaneousSteel.items.filter(item => item.id !== id);
      const updatedMiscellaneousSteel = {
        ...state.currentEstimate.miscellaneousSteel,
        items: updatedItems,
        totalCost: calculateMiscellaneousCost(updatedItems)
      };
      
      return {
        currentEstimate: {
          ...state.currentEstimate,
          miscellaneousSteel: updatedMiscellaneousSteel
        }
      };
    });
    
    get().recalculateAll();
  },
  
  updateRemarks: (remarks) => {
    set((state) => ({
      currentEstimate: {
        ...state.currentEstimate,
        remarks
      }
    }));
  },
  
  updateStructuralSteelOverride: (value) => {
    set((state) => {
      const updatedEstimate = {
        ...state.currentEstimate,
        structuralSteel: {
          ...state.currentEstimate.structuralSteel,
          overriddenTotalCost: value
        }
      };
      
      const structuralSteelCost = updatedEstimate.structuralSteel.visible 
        ? (value ?? updatedEstimate.structuralSteel.totalCost)
        : 0;
      const metalDeckCost = updatedEstimate.metalDeck.visible 
        ? (updatedEstimate.metalDeck.overriddenTotalCost ?? updatedEstimate.metalDeck.totalCost)
        : 0;
      const miscellaneousSteelCost = updatedEstimate.miscellaneousSteel.visible 
        ? (updatedEstimate.miscellaneousSteel.overriddenTotalCost ?? updatedEstimate.miscellaneousSteel.totalCost)
        : 0;
      
      updatedEstimate.totalCost = Math.ceil(structuralSteelCost + metalDeckCost + miscellaneousSteelCost);
      
      return { currentEstimate: updatedEstimate };
    });
  },
  
  updateMetalDeckOverride: (value) => {
    set((state) => {
      const updatedEstimate = {
        ...state.currentEstimate,
        metalDeck: {
          ...state.currentEstimate.metalDeck,
          overriddenTotalCost: value
        }
      };
      
      const structuralSteelCost = updatedEstimate.structuralSteel.visible 
        ? (updatedEstimate.structuralSteel.overriddenTotalCost ?? updatedEstimate.structuralSteel.totalCost)
        : 0;
      const metalDeckCost = updatedEstimate.metalDeck.visible 
        ? (value ?? updatedEstimate.metalDeck.totalCost)
        : 0;
      const miscellaneousSteelCost = updatedEstimate.miscellaneousSteel.visible 
        ? (updatedEstimate.miscellaneousSteel.overriddenTotalCost ?? updatedEstimate.miscellaneousSteel.totalCost)
        : 0;
      
      updatedEstimate.totalCost = Math.ceil(structuralSteelCost + metalDeckCost + miscellaneousSteelCost);
      
      return { currentEstimate: updatedEstimate };
    });
  },
  
  updateMiscellaneousSteelOverride: (value) => {
    set((state) => {
      const updatedEstimate = {
        ...state.currentEstimate,
        miscellaneousSteel: {
          ...state.currentEstimate.miscellaneousSteel,
          overriddenTotalCost: value
        }
      };
      
      const structuralSteelCost = updatedEstimate.structuralSteel.visible 
        ? (updatedEstimate.structuralSteel.overriddenTotalCost ?? updatedEstimate.structuralSteel.totalCost)
        : 0;
      const metalDeckCost = updatedEstimate.metalDeck.visible 
        ? (updatedEstimate.metalDeck.overriddenTotalCost ?? updatedEstimate.metalDeck.totalCost)
        : 0;
      const miscellaneousSteelCost = updatedEstimate.miscellaneousSteel.visible 
        ? (value ?? updatedEstimate.miscellaneousSteel.totalCost)
        : 0;
      
      updatedEstimate.totalCost = Math.ceil(structuralSteelCost + metalDeckCost + miscellaneousSteelCost);
      
      return { currentEstimate: updatedEstimate };
    });
  },
  
  recalculateAll: () => {
    set((state) => {
      const updatedEstimate = { ...state.currentEstimate };
      const { structuralSteel, metalDeck, miscellaneousSteel } = updatedEstimate;
      
      const materialCost = Math.ceil(structuralSteel.materialCost);
      const shopLabourCost = Math.ceil(structuralSteel.shopLabourCost);
      const owsjCost = Math.ceil(structuralSteel.owsj.cost);
      const engineeringDraftingCost = Math.ceil(structuralSteel.engineeringDrafting.totalCost);
      const erectionFreightCost = Math.ceil(structuralSteel.erectionFreight.totalCost);
      
      const subTotal = materialCost + shopLabourCost + owsjCost + engineeringDraftingCost + erectionFreightCost;
      const overhead = Math.ceil(subTotal * (structuralSteel.overheadProfit.overhead / 100));
      const profit = Math.ceil(subTotal * (structuralSteel.overheadProfit.profit / 100));
      
      structuralSteel.totalCost = Math.ceil(subTotal + overhead + profit);
      
      const structuralSteelCost = structuralSteel.visible 
        ? Math.ceil(structuralSteel.overriddenTotalCost ?? structuralSteel.totalCost)
        : 0;
      const metalDeckCost = metalDeck.visible 
        ? Math.ceil(metalDeck.overriddenTotalCost ?? metalDeck.totalCost)
        : 0;
      const miscellaneousSteelCost = miscellaneousSteel.visible 
        ? Math.ceil(miscellaneousSteel.overriddenTotalCost ?? miscellaneousSteel.totalCost)
        : 0;
      
      updatedEstimate.totalCost = Math.ceil(structuralSteelCost + metalDeckCost + miscellaneousSteelCost);
      
      return { currentEstimate: updatedEstimate };
    });
  }
}));
