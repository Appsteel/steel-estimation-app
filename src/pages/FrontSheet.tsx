import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { getEstimate, saveEstimate, deleteEstimate } from '../services/supabaseClient';
import { useEstimateStore } from '../store/estimateStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import Table from '../components/ui/Table';
import Tabs from '../components/ui/Tabs';
import SectionToggle from '../components/ui/SectionToggle';
import OverrideInput from '../components/ui/OverrideInput';
import { downloadAsPDF, downloadAsExcel } from '../utils/exportUtils';
import { FileDown, FilePenLine, Trash2, Save } from 'lucide-react';

const FrontSheet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('project');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const {
    currentEstimate,
    resetEstimate,
    loadEstimate,
    updateProjectInfo,
    toggleStructuralSteelVisibility,
    updateStructuralSteelField,
    addMaterialItem,
    updateMaterialItem,
    removeMaterialItem,
    addLabourItem,
    updateLabourItem,
    removeLabourItem,
    updateOWSJField,
    updateEngineeringDraftingField,
    updateErectionFreightField,
    updateOverheadProfitField,
    toggleMetalDeckVisibility,
    updateMetalDeckField,
    updateMetalDeckCost,
    updateMetalDeckErection,
    toggleMiscellaneousSteelVisibility,
    addMiscellaneousItem,
    updateMiscellaneousItem,
    removeMiscellaneousItem,
    updateRemarks,
    updateStructuralSteelOverride,
    updateMetalDeckOverride,
    updateMiscellaneousSteelOverride,
  } = useEstimateStore();
  
  useEffect(() => {
    const fetchEstimate = async () => {
      if (id) {
        setLoading(true);
        const { data, error } = await getEstimate(id);
        
        if (!error && data) {
          loadEstimate(data);
        } else {
          navigate('/summary');
        }
        
        setLoading(false);
      } else {
        resetEstimate();
        setLoading(false);
      }
    };
    
    fetchEstimate();
  }, [id, loadEstimate, navigate, resetEstimate]);
  
  const handleSave = async () => {
    setSaving(true);
    const { success, id: newId } = await saveEstimate(currentEstimate);
    setSaving(false);
    
    if (success && newId) {
      navigate(`/front-sheet/${newId}`);
    }
  };
  
  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this estimate?')) {
      return;
    }
    
    const { success } = await deleteEstimate(id);
    
    if (success) {
      navigate('/summary');
    }
  };
  
  const tabs = [
    { id: 'project', label: 'Project Info' },
    { id: 'structural', label: 'Structural Steel' },
    { id: 'deck', label: 'Metal Deck' },
    { id: 'misc', label: 'Miscellaneous' },
  ];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const { projectInfo, structuralSteel, metalDeck, miscellaneousSteel, remarks } = currentEstimate;
  
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Front Sheet</h1>
          <p className="text-gray-500">
            Quote #: {projectInfo.quoteNumber}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={<FileDown className="h-5 w-5" />}
            onClick={() => downloadAsPDF(currentEstimate, 'front-sheet')}
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            leftIcon={<FileDown className="h-5 w-5" />}
            onClick={() => downloadAsExcel(currentEstimate, 'front-sheet')}
          >
            Export Excel
          </Button>
          {id && (
            <>
              <Button
                variant="outline"
                leftIcon={<FilePenLine className="h-5 w-5" />}
                onClick={() => navigate(`/quotation/${id}`)}
              >
                Quotation
              </Button>
              <Button
                variant="outline"
                leftIcon={<Trash2 className="h-5 w-5" />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          )}
          <Button
            leftIcon={<Save className="h-5 w-5" />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {activeTab === 'project' && (
        <div className="space-y-6">
          <Card title="Project Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                id="date"
                label="Date"
                type="date"
                value={projectInfo.date}
                onChange={(e) => updateProjectInfo('date', e.target.value)}
              />
              <FormInput
                id="projectName"
                label="Project Name"
                value={projectInfo.projectName}
                onChange={(e) => updateProjectInfo('projectName', e.target.value)}
              />
              <FormInput
                id="projectAddress"
                label="Project Address"
                value={projectInfo.projectAddress}
                onChange={(e) => updateProjectInfo('projectAddress', e.target.value)}
              />
              <FormInput
                id="gcName"
                label="General Contractor"
                value={projectInfo.gcName}
                onChange={(e) => updateProjectInfo('gcName', e.target.value)}
              />
              <FormInput
                id="gcAddress"
                label="GC Address"
                value={projectInfo.gcAddress}
                onChange={(e) => updateProjectInfo('gcAddress', e.target.value)}
              />
              <FormInput
                id="contactPerson"
                label="Contact Person"
                value={projectInfo.contactPerson}
                onChange={(e) => updateProjectInfo('contactPerson', e.target.value)}
              />
              <FormInput
                id="contactPhone"
                label="Contact Phone"
                type="tel"
                value={projectInfo.contactPhone}
                onChange={(e) => updateProjectInfo('contactPhone', e.target.value)}
              />
              <FormInput
                id="closingDate"
                label="Closing Date"
                type="date"
                value={projectInfo.closingDate}
                onChange={(e) => updateProjectInfo('closingDate', e.target.value)}
              />
              <FormInput
                id="estimator"
                label="Estimator"
                value={projectInfo.estimator}
                onChange={(e) => updateProjectInfo('estimator', e.target.value)}
              />
            </div>
          </Card>
          
          <Card title="Drawings Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                id="structuralDrawings"
                label="Structural Drawings"
                value={projectInfo.structuralDrawings}
                onChange={(e) => updateProjectInfo('structuralDrawings', e.target.value)}
              />
              <FormInput
                id="structuralDrawingsDate"
                label="Date"
                type="date"
                value={projectInfo.structuralDrawingsDate}
                onChange={(e) => updateProjectInfo('structuralDrawingsDate', e.target.value)}
              />
              <FormInput
                id="structuralDrawingsRevision"
                label="Revision"
                value={projectInfo.structuralDrawingsRevision}
                onChange={(e) => updateProjectInfo('structuralDrawingsRevision', e.target.value)}
              />
              
              <FormInput
                id="architecturalDrawings"
                label="Architectural Drawings"
                value={projectInfo.architecturalDrawings}
                onChange={(e) => updateProjectInfo('architecturalDrawings', e.target.value)}
              />
              <FormInput
                id="architecturalDrawingsDate"
                label="Date"
                type="date"
                value={projectInfo.architecturalDrawingsDate}
                onChange={(e) => updateProjectInfo('architecturalDrawingsDate', e.target.value)}
              />
              <FormInput
                id="architecturalDrawingsRevision"
                label="Revision"
                value={projectInfo.architecturalDrawingsRevision}
                onChange={(e) => updateProjectInfo('architecturalDrawingsRevision', e.target.value)}
              />
            </div>
          </Card>
          
          <Card title="Additional Contacts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                id="architect"
                label="Architect"
                value={projectInfo.architect}
                onChange={(e) => updateProjectInfo('architect', e.target.value)}
              />
              <FormInput
                id="architectPhone"
                label="Architect Phone"
                type="tel"
                value={projectInfo.architectPhone}
                onChange={(e) => updateProjectInfo('architectPhone', e.target.value)}
              />
              <FormInput
                id="engineer"
                label="Engineer"
                value={projectInfo.engineer}
                onChange={(e) => updateProjectInfo('engineer', e.target.value)}
              />
              <FormInput
                id="engineerPhone"
                label="Engineer Phone"
                type="tel"
                value={projectInfo.engineerPhone}
                onChange={(e) => updateProjectInfo('engineerPhone', e.target.value)}
              />
            </div>
          </Card>
        </div>
      )}
      
      {activeTab === 'structural' && (
        <div className="space-y-6">
          <SectionToggle
            title="Structural Steel"
            isVisible={structuralSteel.visible}
            toggleVisibility={toggleStructuralSteelVisibility}
          />
          
          {structuralSteel.visible && (
            <>
              <Card title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormInput
                    id="area"
                    label="Area (Sq.ft)"
                    type="number"
                    value={structuralSteel.area || ''}
                    onChange={(e) => updateStructuralSteelField('area', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="weight"
                    label="Weight (lbs)"
                    type="number"
                    value={structuralSteel.weight || ''}
                    onChange={(e) => updateStructuralSteelField('weight', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="connectionAllowance"
                    label="Connection Allowance (%)"
                    type="number"
                    value={structuralSteel.connectionAllowance || ''}
                    onChange={(e) => updateStructuralSteelField('connectionAllowance', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Weight</div>
                    <div className="text-lg font-semibold">{structuralSteel.totalWeight.toLocaleString()} lbs</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Tons</div>
                    <div className="text-lg font-semibold">{structuralSteel.totalTons.toFixed(2)} tons</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Price per Ton</div>
                    <div className="text-lg font-semibold">${structuralSteel.pricePerTon.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Price per Sq.ft</div>
                    <div className="text-lg font-semibold">${structuralSteel.pricePerSqft.toLocaleString()}</div>
                  </div>
                </div>
              </Card>
              
              <Card title="Material">
                <Table
                  columns={[
                    { header: 'Description', accessor: 'description', className: 'w-1/3' },
                    {
                      header: 'Weight',
                      accessor: (row) => (
                        <FormInput
                          id={`material-weight-${row.id}`}
                          type="number"
                          value={row.weight || ''}
                          onChange={(e) => updateMaterialItem(row.id, 'weight', parseFloat(e.target.value) || 0)}
                          hideLabel
                        />
                      ),
                    },
                    {
                      header: 'Unit Rate',
                      accessor: (row) => (
                        <FormInput
                          id={`material-rate-${row.id}`}
                          type="number"
                          value={row.unitRate || ''}
                          onChange={(e) => updateMaterialItem(row.id, 'unitRate', parseFloat(e.target.value) || 0)}
                          hideLabel
                        />
                      ),
                    },
                    {
                      header: 'Total Cost',
                      accessor: (row) => `$${row.totalCost.toLocaleString()}`,
                      className: 'text-right',
                    },
                    {
                      header: '',
                      accessor: (row) => (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => removeMaterialItem(row.id)}
                        >
                          Remove
                        </Button>
                      ),
                      className: 'w-24',
                    },
                  ]}
                  data={structuralSteel.material}
                  keyField="id"
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={addMaterialItem}
                  >
                    Add Item
                  </Button>
                  <div className="text-lg font-semibold">
                    Total: ${structuralSteel.materialCost.toLocaleString()}
                  </div>
                </div>
              </Card>
              
              <Card title="Shop Labour">
                <Table
                  columns={[
                    { header: 'Member Group', accessor: 'memberGroup', className: 'w-1/4' },
                    {
                      header: 'Total Pcs',
                      accessor: (row) => (
                        <FormInput
                          id={`labour-pcs-${row.id}`}
                          type="number"
                          value={row.totalPcs || ''}
                          onChange={(e) => updateLabourItem(row.id, 'totalPcs', parseFloat(e.target.value) || 0)}
                          hideLabel
                        />
                      ),
                    },
                    {
                      header: 'Pcs/Day',
                      accessor: (row) => (
                        <FormInput
                          id={`labour-pcsday-${row.id}`}
                          type="number"
                          value={row.pcsPerDay || ''}
                          onChange={(e) => updateLabourItem(row.id, 'pcsPerDay', parseFloat(e.target.value) || 0)}
                          hideLabel
                        />
                      ),
                    },
                    {
                      header: 'Hours',
                      accessor: (row) => row.hours,
                    },
                    {
                      header: 'Hourly Rate',
                      accessor: (row) => (
                        <FormInput
                          id={`labour-rate-${row.id}`}
                          type="number"
                          value={row.hourlyRate || ''}
                          onChange={(e) => updateLabourItem(row.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                          hideLabel
                        />
                      ),
                    },
                    {
                      header: 'Total Cost',
                      accessor: (row) => `$${row.totalCost.toLocaleString()}`,
                      className: 'text-right',
                    },
                    {
                      header: '',
                      accessor: (row) => (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => removeLabourItem(row.id)}
                        >
                          Remove
                        </Button>
                      ),
                      className: 'w-24',
                    },
                  ]}
                  data={structuralSteel.shopLabour}
                  keyField="id"
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={addLabourItem}
                  >
                    Add Item
                  </Button>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-gray-500">Hours/Ton: {structuralSteel.hoursPerTon.toFixed(2)}</div>
                    <div className="text-lg font-semibold">
                      Total: ${structuralSteel.shopLabourCost.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card title="O.W.S.J">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormInput
                    id="owsjSupplier"
                    label="Supplier"
                    value={structuralSteel.owsj.supplier}
                    onChange={(e) => updateOWSJField('supplier', e.target.value)}
                  />
                  <FormInput
                    id="owsjPcs"
                    label="Pcs"
                    type="number"
                    value={structuralSteel.owsj.pcs || ''}
                    onChange={(e) => updateOWSJField('pcs', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="owsjWeight"
                    label="Weight"
                    type="number"
                    value={structuralSteel.owsj.weight || ''}
                    onChange={(e) => updateOWSJField('weight', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="owsjPricePerWeight"
                    label="Price/Weight"
                    type="number"
                    value={structuralSteel.owsj.pricePerWeight || ''}
                    onChange={(e) => updateOWSJField('pricePerWeight', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="mt-4 text-right">
                  <div className="text-lg font-semibold">
                    Total: ${structuralSteel.owsj.cost.toLocaleString()}
                  </div>
                </div>
              </Card>
              
              <Card title="Engineering & Drafting">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormInput
                    id="engineering"
                    label="Engineering"
                    type="number"
                    value={structuralSteel.engineeringDrafting.engineering || ''}
                    onChange={(e) => updateEngineeringDraftingField('engineering', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="draftingTons"
                    label="Drafting Tons"
                    type="number"
                    value={structuralSteel.engineeringDrafting.draftingTons || ''}
                    onChange={(e) => updateEngineeringDraftingField('draftingTons', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="draftingPricePerTon"
                    label="Drafting Price/Ton"
                    type="number"
                    value={structuralSteel.engineeringDrafting.draftingPricePerTon || ''}
                    onChange={(e) => updateEngineeringDraftingField('draftingPricePerTon', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="mt-4 text-right space-y-1">
                  <div className="text-sm text-gray-500">
                    Drafting Cost: ${structuralSteel.engineeringDrafting.draftingCost.toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold">
                    Total: ${structuralSteel.engineeringDrafting.totalCost.toLocaleString()}
                  </div>
                </div>
              </Card>
              
              <Card title="Erection & Freight">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormInput
                    id="erector"
                    label="Erector"
                    value={structuralSteel.erectionFreight.erector}
                    onChange={(e) => updateErectionFreightField('erector', e.target.value)}
                  />
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Tons (incl. OWSJ)</div>
                    <div className="text-lg font-semibold">{structuralSteel.erectionFreight.tons.toFixed(2)}</div>
                  </div>
                  <FormInput
                    id="pricePerTon"
                    label="Price/Ton"
                    type="number"
                    value={structuralSteel.erectionFreight.pricePerTon || ''}
                    onChange={(e) => updateErectionFreightField('pricePerTon', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="premium"
                    label="Premium"
                    type="number"
                    value={structuralSteel.erectionFreight.premium || ''}
                    onChange={(e) => updateErectionFreightField('premium', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormInput
                    id="regularTrips"
                    label="Regular Trips"
                    type="number"
                    value={structuralSteel.erectionFreight.regularTrips || ''}
                    onChange={(e) => updateErectionFreightField('regularTrips', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="regularTripCost"
                    label="Regular Trip Cost"
                    type="number"
                    value={structuralSteel.erectionFreight.regularTripCost || ''}
                    onChange={(e) => updateErectionFreightField('regularTripCost', parseFloat(e.target.value) || 0)}
                  />
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Trailer Trips</div>
                    <div className="text-lg font-semibold">{structuralSteel.erectionFreight.trailerTrips}</div>
                  </div>
                  <FormInput
                    id="trailerTripCost"
                    label="Trailer Trip Cost"
                    type="number"
                    value={structuralSteel.erectionFreight.trailerTripCost || ''}
                    onChange={(e) => updateErectionFreightField('trailerTripCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="mt-4 text-right space-y-1">
                  <div className="text-sm text-gray-500">
                    Erection Cost: ${structuralSteel.erectionFreight.erectionCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Freight Cost: ${structuralSteel.erectionFreight.freightCost.toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold">
                    Total: ${structuralSteel.erectionFreight.totalCost.toLocaleString()}
                  </div>
                </div>
              </Card>
              
              <Card title="Overhead & Profit">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    id="overhead"
                    label="Overhead %"
                    type="number"
                    value={structuralSteel.overheadProfit.overhead || ''}
                    onChange={(e) => updateOverheadProfitField('overhead', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="profit"
                    label="Profit %"
                    type="number"
                    value={structuralSteel.overheadProfit.profit || ''}
                    onChange={(e) => updateOverheadProfitField('profit', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="mt-4 text-right">
                  <div className="text-lg font-semibold">
                    Total: {structuralSteel.overheadProfit.totalPercentage}%
                  </div>
                </div>
              </Card>
              
              <Card>
                <OverrideInput
                  actualValue={structuralSteel.totalCost}
                  overriddenValue={structuralSteel.overriddenTotalCost}
                  onOverride={updateStructuralSteelOverride}
                  label="Total Structural Steel Cost"
                />
              </Card>
            </>
          )}
        </div>
      )}
      
      {activeTab === 'deck' && (
        <div className="space-y-6">
          <SectionToggle
            title="Metal Deck"
            isVisible={metalDeck.visible}
            toggleVisibility={toggleMetalDeckVisibility}
          />
          
          {metalDeck.visible && (
            <>
              <Card title="Metal Deck Cost">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    id="deckCost"
                    label="Deck Cost"
                    type="number"
                    value={metalDeck.deckCost || ''}
                    onChange={(e) => updateMetalDeckCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </Card>
              
              <Card title="Metal Deck Erection">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    id="erectionArea"
                    label="Area (Sq.ft)"
                    type="number"
                    value={metalDeck.erection.area || ''}
                    onChange={(e) => updateMetalDeckErection('area', parseFloat(e.target.value) || 0)}
                  />
                  <FormInput
                    id="erectionPricePerSqft"
                    label="Price/Sq.ft"
                    type="number"
                    value={metalDeck.erection.pricePerSqft || ''}
                    onChange={(e) => updateMetalDeckErection('pricePerSqft', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="mt-4 text-right">
                  <div className="text-lg font-semibold">
                    Erection Cost: ${metalDeck.erection.totalCost.toLocaleString()}
                  </div>
                </div>
              </Card>
              
              <Card>
                <OverrideInput
                  actualValue={metalDeck.totalCost}
                  overriddenValue={metalDeck.overriddenTotalCost}
                  onOverride={updateMetalDeckOverride}
                  label="Total Metal Deck Cost"
                />
              </Card>
            </>
          )}
        </div>
      )}
      
      {activeTab === 'misc' && (
        <div className="space-y-6">
          <SectionToggle
            title="Miscellaneous Steel"
            isVisible={miscellaneousSteel.visible}
            toggleVisibility={toggleMiscellaneousSteelVisibility}
          />
          
          {miscellaneousSteel.visible && (
            <>
              <Card>
                <Table
                  columns={[
                    {
                      header: 'Type',
                      accessor: (row) => (
                        <FormSelect
                          id={`misc-type-${row.id}`}
                          options={[
                            { value: 'S/O', label: 'S/O' },
                            { value: 'S/I', label: 'S/I' },
                          ]}
                          value={row.type}
                          onChange={(e) => updateMiscellaneousItem(row.id, 'type', e.target.value)}
                          hideLabel
                        />
                      ),
                      className: 'w-24',
                    },
                    {
                      header: 'Description',
                      accessor: (row) => (
                        <FormInput
                          id={`misc-desc-${row.id}`}
                          value={row.description}
                          onChange={(e) => updateMiscellaneousItem(row.id, 'description', e.target.value)}
                          hideLabel
                        />
                      ),
                      className: 'w-1/3',
                    },
                    {
                      header: 'Unit',
                      accessor: (row) => (
                        <FormInput
                          id={`misc-unit-${row.id}`}
                          type="number"
                          value={row.unit || ''}
                          onChange={(e) => updateMiscellaneousItem(row.id, 'unit', parseFloat(e.target.value) || 0)}
                          hideLabel
                        />
                      ),
                    },
                    {
                      header: 'Unit Rate',
                      accessor: (row) => (
                        <FormInput
                          id={`misc-rate-${row.id}`}
                          type="number"
                          value={row.unitRate || ''}
                          onChange={(e) => updateMiscellaneousItem(row.id, 'unitRate', parseFloat(e.target.value) || 0)}
                          hideLabel
                        />
                      ),
                    },
                    {
                      header: 'Total Cost',
                      accessor: (row) => `$${row.totalCost.toLocaleString()}`,
                      className: 'text-right',
                    },
                    {
                      header: '',
                      accessor: (row) => (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => removeMiscellaneousItem(row.id)}
                        >
                          Remove
                        </Button>
                      ),
                      className: 'w-24',
                    },
                  ]}
                  data={miscellaneousSteel.items}
                  keyField="id"
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={addMiscellaneousItem}
                  >
                    Add Item
                  </Button>
                  <div className="text-lg font-semibold">
                    Total: ${miscellaneousSteel.totalCost.toLocaleString()}
                  </div>
                </div>
              </Card>
              
              <Card>
                <OverrideInput
                  actualValue={miscellaneousSteel.totalCost}
                  overriddenValue={miscellaneousSteel.overriddenTotalCost}
                  onOverride={updateMiscellaneousSteelOverride}
                  label="Total Miscellaneous Steel Cost"
                />
              </Card>
            </>
          )}
        </div>
      )}
      
      <Card title="Remarks">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
          rows={4}
          value={remarks}
          onChange={(e) => updateRemarks(e.target.value)}
          placeholder="Add any remarks here..."
        />
      </Card>
      
      <Card>
        <div className="text-xl font-bold text-right">
          Total Cost: ${currentEstimate.totalCost.toLocaleString()}
        </div>
      </Card>
    </div>
  );
};

export default FrontSheet;