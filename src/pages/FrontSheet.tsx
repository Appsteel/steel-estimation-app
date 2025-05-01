import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEstimateStore } from '../store/estimateStore';
import { saveEstimate, getEstimate, deleteEstimate } from '../services/supabaseClient';
import { MaterialItem, LabourItem, MiscellaneousItem } from '../types/estimate';
import { v4 as uuidv4 } from 'uuid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import SectionToggle from '../components/ui/SectionToggle';
import OverrideInput from '../components/ui/OverrideInput';
import { Save, FileDown, FilePlus, Trash2, Plus, FileText } from 'lucide-react';
import { downloadAsPDF, downloadAsExcel } from '../utils/exportUtils';

const FrontSheet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
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
    toggleMiscellaneousSteelVisibility,
    addMiscellaneousItem,
    updateMiscellaneousItem,
    removeMiscellaneousItem,
    updateRemarks,
    updateStructuralSteelOverride,
    updateMetalDeckOverride,
    updateMiscellaneousSteelOverride,
    recalculateAll
  } = useEstimateStore();
  
  useEffect(() => {
    // Reset form when navigating to a new estimate
    if (!id) {
      resetEstimate();
      return;
    }
    
    const fetchEstimate = async () => {
      setLoading(true);
      const { data, error } = await getEstimate(id);
      
      if (!error && data) {
        loadEstimate(data);
      } else {
        // Handle error - redirect to new estimate form
        navigate('/front-sheet');
      }
      
      setLoading(false);
    };
    
    fetchEstimate();
  }, [id, navigate, resetEstimate, loadEstimate]);
  
  useEffect(() => {
    // Recalculate everything when component mounts
    recalculateAll();
  }, [recalculateAll]);
  
  const handleSave = async (useNewNumber: boolean = false) => {
    setSaving(true);
    
    // Update estimate number if needed
    if (id && useNewNumber) {
      // Generate a new quote number or append revision
      const currentQuoteNumber = currentEstimate.projectInfo.quoteNumber;
      const newQuoteNumber = currentQuoteNumber.includes('R')
        ? currentQuoteNumber.replace(/R\d+$/, `R${parseInt(currentQuoteNumber.split('R')[1] || '0') + 1}`)
        : `${currentQuoteNumber}R1`;
      
      updateProjectInfo('quoteNumber', newQuoteNumber);
    }
    
    const estimateToSave = {
      ...currentEstimate,
      id: useNewNumber ? undefined : id,  // Remove ID to create a new entry if using new number
      updated_at: new Date().toISOString()
    };
    
    if (!estimateToSave.id) {
      estimateToSave.created_at = new Date().toISOString();
    }
    
    const { success, error, id: newId } = await saveEstimate(estimateToSave);
    
    setSaving(false);
    
    if (success) {
      // Navigate to the saved estimate
      if (newId && (!id || useNewNumber)) {
        navigate(`/front-sheet/${newId}`);
      }
    } else {
      // Handle error
      console.error('Error saving estimate:', error);
      alert('Error saving estimate. Please try again.');
    }
  };
  
  const handleCreateQuotation = () => {
    if (id) {
      navigate(`/quotation/${id}`);
    } else {
      // Save first then navigate to quotation
      handleSave().then(() => {
        if (currentEstimate.id) {
          navigate(`/quotation/${currentEstimate.id}`);
        }
      });
    }
  };
  
  const handleExportPDF = () => {
    downloadAsPDF(currentEstimate, 'front-sheet');
  };
  
  const handleExportExcel = () => {
    downloadAsExcel(currentEstimate, 'front-sheet');
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    const { success, error } = await deleteEstimate(id);
    
    if (success) {
      navigate('/summary');
    } else {
      alert('Error deleting estimate: ' + error);
      setDeleting(false);
    }
    setShowDeleteDialog(false);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-12">
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Estimate?</h2>
            <p className="mb-4">Are you sure you want to delete this estimate? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Dialog */}
      {showRevisionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Update Quote Number?</h2>
            <p className="mb-4">Do you want to create a new revision for this quote?</p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRevisionDialog(false);
                  handleSave(false);
                }}
              >
                Keep Same Number
              </Button>
              <Button 
                onClick={() => {
                  setShowRevisionDialog(false);
                  handleSave(true);
                }}
              >
                Create Revision
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Front Sheet</h1>
          <p className="text-gray-500">
            Quote #: {currentEstimate.projectInfo.quoteNumber}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={<FileDown className="h-5 w-5" />}
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            leftIcon={<FileDown className="h-5 w-5" />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
          <Button
            leftIcon={<FileText className="h-5 w-5" />}
            onClick={handleCreateQuotation}
          >
            Create Quotation
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save className="h-5 w-5" />}
            onClick={() => id ? setShowRevisionDialog(true) : handleSave()}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {id && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
      
      {/* Total Summary Box */}
      <Card className="bg-blue-50 border border-blue-200">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Total Cost</h2>
              <p className="text-3xl font-bold text-blue-700">
                ${currentEstimate.totalCost.toLocaleString()}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentEstimate.structuralSteel.visible && (
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Structural Steel</p>
                  <p className="text-lg font-semibold">
                    ${(currentEstimate.structuralSteel.overriddenTotalCost ?? 
                       currentEstimate.structuralSteel.totalCost).toLocaleString()}
                    {currentEstimate.structuralSteel.overriddenTotalCost !== undefined && 
                      <span className="text-xs text-blue-600 ml-1">(Overridden)</span>
                    }
                  </p>
                </div>
              )}
              
              {currentEstimate.metalDeck.visible && (
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Metal Deck</p>
                  <p className="text-lg font-semibold">
                    ${(currentEstimate.metalDeck.overriddenTotalCost ?? 
                       currentEstimate.metalDeck.totalCost).toLocaleString()}
                    {currentEstimate.metalDeck.overriddenTotalCost !== undefined && 
                      <span className="text-xs text-blue-600 ml-1">(Overridden)</span>
                    }
                  </p>
                </div>
              )}
              
              {currentEstimate.miscellaneousSteel.visible && (
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Miscellaneous</p>
                  <p className="text-lg font-semibold">
                    ${(currentEstimate.miscellaneousSteel.overriddenTotalCost ?? 
                       currentEstimate.miscellaneousSteel.totalCost).toLocaleString()}
                    {currentEstimate.miscellaneousSteel.overriddenTotalCost !== undefined && 
                      <span className="text-xs text-blue-600 ml-1">(Overridden)</span>
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Override Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentEstimate.structuralSteel.visible && (
              <OverrideInput
                label="Structural Steel Override"
                actualValue={currentEstimate.structuralSteel.totalCost}
                overriddenValue={currentEstimate.structuralSteel.overriddenTotalCost}
                onOverride={updateStructuralSteelOverride}
              />
            )}
            
            {currentEstimate.metalDeck.visible && (
              <OverrideInput
                label="Metal Deck Override"
                actualValue={currentEstimate.metalDeck.totalCost}
                overriddenValue={currentEstimate.metalDeck.overriddenTotalCost}
                onOverride={updateMetalDeckOverride}
              />
            )}
            
            {currentEstimate.miscellaneousSteel.visible && (
              <OverrideInput
                label="Miscellaneous Steel Override"
                actualValue={currentEstimate.miscellaneousSteel.totalCost}
                overriddenValue={currentEstimate.miscellaneousSteel.overriddenTotalCost}
                onOverride={updateMiscellaneousSteelOverride}
              />
            )}
          </div>
        </div>
      </Card>
      
      {/* Project Information */}
      <Card title="Project Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput
            id="date"
            label="Date"
            type="date"
            value={currentEstimate.projectInfo.date}
            onChange={(e) => updateProjectInfo('date', e.target.value)}
          />
          
          <FormInput
            id="gcName"
            label="General Contractor Name"
            value={currentEstimate.projectInfo.gcName}
            onChange={(e) => updateProjectInfo('gcName', e.target.value)}
          />
          
          <FormInput
            id="gcAddress"
            label="General Contractor Address"
            value={currentEstimate.projectInfo.gcAddress}
            onChange={(e) => updateProjectInfo('gcAddress', e.target.value)}
          />
          
          <FormInput
            id="projectName"
            label="Project Name"
            value={currentEstimate.projectInfo.projectName}
            onChange={(e) => updateProjectInfo('projectName', e.target.value)}
          />
          
          <FormInput
            id="projectAddress"
            label="Project Address"
            value={currentEstimate.projectInfo.projectAddress}
            onChange={(e) => updateProjectInfo('projectAddress', e.target.value)}
          />
          
          <FormInput
            id="estimator"
            label="Estimator"
            value={currentEstimate.projectInfo.estimator}
            onChange={(e) => updateProjectInfo('estimator', e.target.value)}
          />
          
          <FormInput
            id="closingDate"
            label="Closing Date"
            type="date"
            value={currentEstimate.projectInfo.closingDate}
            onChange={(e) => updateProjectInfo('closingDate', e.target.value)}
          />
          
          <FormInput
            id="contactPerson"
            label="Contact Person"
            value={currentEstimate.projectInfo.contactPerson}
            onChange={(e) => updateProjectInfo('contactPerson', e.target.value)}
          />
          
          <FormInput
            id="contactPhone"
            label="Contact Person Phone"
            type="tel"
            value={currentEstimate.projectInfo.contactPhone}
            onChange={(e) => updateProjectInfo('contactPhone', e.target.value)}
            placeholder="(XXX) XXX-XXXX"
          />
          
          <FormInput
            id="architect"
            label="Architect (Name)"
            value={currentEstimate.projectInfo.architect}
            onChange={(e) => updateProjectInfo('architect', e.target.value)}
          />
          
          <FormInput
            id="architectPhone"
            label="Architect (Phone)"
            type="tel"
            value={currentEstimate.projectInfo.architectPhone}
            onChange={(e) => updateProjectInfo('architectPhone', e.target.value)}
            placeholder="(XXX) XXX-XXXX"
          />
          
          <FormInput
            id="engineer"
            label="Structural Engineer (Name)"
            value={currentEstimate.projectInfo.engineer}
            onChange={(e) => updateProjectInfo('engineer', e.target.value)}
          />
          
          <FormInput
            id="engineerPhone"
            label="Structural Engineer (Phone)"
            type="tel"
            value={currentEstimate.projectInfo.engineerPhone}
            onChange={(e) => updateProjectInfo('engineerPhone', e.target.value)}
            placeholder="(XXX) XXX-XXXX"
          />
        </div>
        
        <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Reference Drawings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            id="structuralDrawings"
            label="Structural Drawings (Name of set)"
            value={currentEstimate.projectInfo.structuralDrawings}
            onChange={(e) => updateProjectInfo('structuralDrawings', e.target.value)}
          />
          
          <FormInput
            id="structuralDrawingsDate"
            label="Date Issued"
            type="date"
            value={currentEstimate.projectInfo.structuralDrawingsDate}
            onChange={(e) => updateProjectInfo('structuralDrawingsDate', e.target.value)}
          />
          
          <FormInput
            id="structuralDrawingsRevision"
            label="Current Revision of Drawings"
            value={currentEstimate.projectInfo.structuralDrawingsRevision}
            onChange={(e) => updateProjectInfo('structuralDrawingsRevision', e.target.value)}
          />
          
          <FormInput
            id="architecturalDrawings"
            label="Architectural Drawings (Name of set)"
            value={currentEstimate.projectInfo.architecturalDrawings}
            onChange={(e) => updateProjectInfo('architecturalDrawings', e.target.value)}
          />
          
          <FormInput
            id="architecturalDrawingsDate"
            label="Date Issued"
            type="date"
            value={currentEstimate.projectInfo.architecturalDrawingsDate}
            onChange={(e) => updateProjectInfo('architecturalDrawingsDate', e.target.value)}
          />
          
          <FormInput
            id="architecturalDrawingsRevision"
            label="Current Revision of Drawings"
            value={currentEstimate.projectInfo.architecturalDrawingsRevision}
            onChange={(e) => updateProjectInfo('architecturalDrawingsRevision', e.target.value)}
          />
        </div>
      </Card>
      
      {/* Structural Steel Cost */}
      <div className={currentEstimate.structuralSteel.visible ? '' : 'opacity-60'}>
        <SectionToggle
          title="Structural Steel Cost"
          isVisible={currentEstimate.structuralSteel.visible}
          toggleVisibility={toggleStructuralSteelVisibility}
        />
        
        <Card className={`${!currentEstimate.structuralSteel.visible ? 'pointer-events-none' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FormInput
              id="structuralSteelArea"
              label="Area (SQFT)"
              type="number"
              value={currentEstimate.structuralSteel.area || ''}
              onChange={(e) => updateStructuralSteelField('area', parseFloat(e.target.value) || 0)}
            />
            
            <FormInput
              id="structuralSteelWeight"
              label="Weight (lbs)"
              type="number"
              value={currentEstimate.structuralSteel.weight || ''}
              onChange={(e) => updateStructuralSteelField('weight', parseFloat(e.target.value) || 0)}
            />
            
            <FormInput
              id="connectionAllowance"
              label="Allowance for connections (%)"
              type="number"
              value={currentEstimate.structuralSteel.connectionAllowance || ''}
              onChange={(e) => updateStructuralSteelField('connectionAllowance', parseFloat(e.target.value) || 0)}
            />
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Weight (lbs)
              </label>
              <div className="text-lg font-semibold">
                {currentEstimate.structuralSteel.totalWeight.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Tons
              </label>
              <div className="text-lg font-semibold">
                {currentEstimate.structuralSteel.totalTons.toFixed(2)}
              </div>
            </div>
          </div>
          
          {/* Material Section */}
          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Material</h3>
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Weight/Qty (lbs)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit Rate ($/lbs)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Cost ($)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEstimate.structuralSteel.material.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.description}
                        onChange={(e) => updateMaterialItem(item.id, 'description', e.target.value)}
                        disabled={index === 0} // Disable editing First Weight description
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.weight || ''}
                        onChange={(e) => updateMaterialItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                        disabled={index === 0} // Disable editing First Weight weight
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.unitRate || ''}
                        onChange={(e) => updateMaterialItem(item.id, 'unitRate', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                      ${item.totalCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {index !== 0 && ( // Don't show delete button for First Weight
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => removeMaterialItem(item.id)}
                          leftIcon={<Trash2 className="h-4 w-4" />}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="px-6 py-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addMaterialItem}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add Item
                    </Button>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Material Cost:
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ${currentEstimate.structuralSteel.materialCost.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Shop Labour Section */}
          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Shop Labour</h3>
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Member Group
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Pcs
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pcs/Day
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hours
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    $/Hour
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Cost ($)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEstimate.structuralSteel.shopLabour.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.memberGroup}
                        onChange={(e) => updateLabourItem(item.id, 'memberGroup', e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.totalPcs || ''}
                        onChange={(e) => updateLabourItem(item.id, 'totalPcs', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.pcsPerDay || ''}
                        onChange={(e) => updateLabourItem(item.id, 'pcsPerDay', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.hours.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.hourlyRate || ''}
                        onChange={(e) => updateLabourItem(item.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                      ${item.totalCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removeLabourItem(item.id)}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={7} className="px-6 py-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addLabourItem}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add Item
                    </Button>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={5} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Shop Labour Cost:
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ${currentEstimate.structuralSteel.shopLabourCost.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* O.W.S.J Cost */}
          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">O.W.S.J Cost</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <FormInput
              id="owsjSupplier"
              label="Supplier"
              value={currentEstimate.structuralSteel.owsj.supplier}
              onChange={(e) => updateOWSJField('supplier', e.target.value)}
            />
            
            <FormInput
              id="owsjPcs"
              label="Pcs"
              type="number"
              value={currentEstimate.structuralSteel.owsj.pcs || ''}
              onChange={(e) => updateOWSJField('pcs', parseFloat(e.target.value) || 0)}
            />
            
            <FormInput
              id="owsjWeight"
              label="Weight"
              type="number"
              value={currentEstimate.structuralSteel.owsj.weight || ''}
              onChange={(e) => updateOWSJField('weight', parseFloat(e.target.value) || 0)}
            />
            
            <FormInput
              id="owsjPricePerWeight"
              label="Price per Weight"
              type="number"
              step="0.01"
              value={currentEstimate.structuralSteel.owsj.pricePerWeight || ''}
              onChange={(e) => updateOWSJField('pricePerWeight', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              O.W.S.J Cost
            </label>
            <div className="text-lg font-semibold">
              ${currentEstimate.structuralSteel.owsj.cost.toLocaleString()}
            </div>
          </div>
          
          {/* Engineering & Drafting Cost */}
          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Engineering & Drafting Cost</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormInput
              id="engineering"
              label="Engineering ($)"
              type="number"
              step="0.01"
              value={currentEstimate.structuralSteel.engineeringDrafting.engineering || ''}
              onChange={(e) => updateEngineeringDraftingField('engineering', parseFloat(e.target.value) || 0)}
            />
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Tons
              </label>
              <div className="text-lg font-semibold">
                {currentEstimate.structuralSteel.engineeringDrafting.draftingTons.toFixed(2)}
              </div>
            </div>
            
            <FormInput
              id="draftingPricePerTon"
              label="Price per Ton"
              type="number"
              step="0.01"
              value={currentEstimate.structuralSteel.engineeringDrafting.draftingPricePerTon || ''}
              onChange={(e) => updateEngineeringDraftingField('draftingPricePerTon', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Drafting Cost
              </label>
              <div className="text-lg font-semibold">
                ${currentEstimate.structuralSteel.engineeringDrafting.draftingCost.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engineering & Drafting Cost
              </label>
              <div className="text-lg font-semibold">
                ${currentEstimate.structuralSteel.engineeringDrafting.totalCost.toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Erection & Freight Cost */}
          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Erection & Freight Cost</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <FormInput
              id="erector"
              label="Erector"
              value={currentEstimate.structuralSteel.erectionFreight.erector}
              onChange={(e) => updateErectionFreightField('erector', e.target.value)}
            />
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Tons
              </label>
              <div className="text-lg font-semibold">
                {currentEstimate.structuralSteel.erectionFreight.tons.toFixed(2)}
              </div>
            </div>
            
            <FormInput
              id="pricePerTon"
              label="Price per Ton"
              type="number"
              step="0.01"
              value={currentEstimate.structuralSteel.erectionFreight.pricePerTon || ''}
              onChange={(e) => updateErectionFreightField('pricePerTon', parseFloat(e.target.value) || 0)}
            />
            
            <FormInput
              id="premium"
              label="Premium"
              type="number"
              step="0.01"
              value={currentEstimate.structuralSteel.erectionFreight.premium || ''}
              onChange={(e) => updateErectionFreightField('premium', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Erection Cost
            </label>
            <div className="text-lg font-semibold">
              ${currentEstimate.structuralSteel.erectionFreight.erectionCost.toLocaleString()}
            </div>
          </div>
          
          <h4 className="text-md font-medium text-gray-700 mb-2">Freight</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <FormInput
              id="regularTrips"
              label="Regular Trips"
              type="number"
              value={currentEstimate.structuralSteel.erectionFreight.regularTrips || ''}
              onChange={(e) => updateErectionFreightField('regularTrips', parseFloat(e.target.value) || 0)}
            />
            
            <FormInput
              id="regularTripCost"
              label="Cost/trip"
              type="number"
              step="0.01"
              value={currentEstimate.structuralSteel.erectionFreight.regularTripCost || ''}
              onChange={(e) => updateErectionFreightField('regularTripCost', parseFloat(e.target.value) || 0)}
            />
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trailer Trips
              </label>
              <div className="text-lg font-semibold">
                {currentEstimate.structuralSteel.erectionFreight.trailerTrips}
              </div>
            </div>
            
            <FormInput
              id="trailerTripCost"
              label="Cost/trip"
              type="number"
              step="0.01"
              value={currentEstimate.structuralSteel.erectionFreight.trailerTripCost || ''}
              onChange={(e) => updateErectionFreightField('trailerTripCost', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Freight Charges
              </label>
              <div className="text-lg font-semibold">
                ${currentEstimate.structuralSteel.erectionFreight.freightCost.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Erection & Freight Cost
              </label>
              <div className="text-lg font-semibold">
                ${currentEstimate.structuralSteel.erectionFreight.totalCost.toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Overhead & Profit */}
          <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Overhead & Profit</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormInput
              id="overhead"
              label="Overhead (%)"
              type="number"
              step="0.01"
              value={currentEstimate.structuralSteel.overheadProfit.overhead || ''}
              onChange={(e) => updateOverheadProfitField('overhead', parseFloat(e.target.value) || 0)}
            />
            
            <FormInput
              id="profit"
              label="Profit (%)"
              type="number"
              step="0.01"
              value={currentEstimate.structuralSteel.overheadProfit.profit || ''}
              onChange={(e) => updateOverheadProfitField('profit', parseFloat(e.target.value) || 0)}
            />
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Percentage
              </label>
              <div className="text-lg font-semibold">
                {currentEstimate.structuralSteel.overheadProfit.totalPercentage}%
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Total Structural Steel Cost</h3>
              <div className="text-xl font-bold text-blue-700">
                ${currentEstimate.structuralSteel.totalCost.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Metal Deck Cost */}
      <div className={currentEstimate.metalDeck.visible ? '' : 'opacity-60'}>
        <SectionToggle
          title="Metal Deck Cost"
          isVisible={currentEstimate.metalDeck.visible}
          toggleVisibility={toggleMetalDeckVisibility}
        />
        
        <Card className={`${!currentEstimate.metalDeck.visible ? 'pointer-events-none' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (SQFT)
              </label>
              <div className="text-lg font-semibold">
                {currentEstimate.metalDeck.area.toLocaleString()}
              </div>
            </div>
            
            <FormInput
              id="costPerSqft"
              label="Cost per SQFT"
              type="number"
              step="0.01"
              value={currentEstimate.metalDeck.costPerSqft || ''}
              onChange={(e) => updateMetalDeckField('costPerSqft', parseFloat(e.target.value) || 0)}
            />
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total
              </label>
              <div className="text-lg font-semibold">
                ${currentEstimate.metalDeck.totalCost.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Total Metal Deck Cost</h3>
              <div className="text-xl font-bold text-blue-700">
                ${currentEstimate.metalDeck.totalCost.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Miscellaneous Steel Cost */}
      <div className={currentEstimate.miscellaneousSteel.visible ? '' : 'opacity-60'}>
        <SectionToggle
          title="Miscellaneous Steel Cost"
          isVisible={currentEstimate.miscellaneousSteel.visible}
          toggleVisibility={toggleMiscellaneousSteelVisibility}
        />
        
        <Card className={`${!currentEstimate.miscellaneousSteel.visible ? 'pointer-events-none' : ''}`}>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit Rate ($)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Cost ($)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEstimate.miscellaneousSteel.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <FormSelect
                        id={`type-${item.id}`}
                        hideLabel
                        options={[
                          { value: 'S/O', label: 'S/O' },
                          { value: 'S/I', label: 'S/I' },
                        ]}
                        value={item.type}
                        onChange={(e) => updateMiscellaneousItem(item.id, 'type', e.target.value as 'S/O' | 'S/I')}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.description}
                        onChange={(e) => updateMiscellaneousItem(item.id, 'description', e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.unit || ''}
                        onChange={(e) => updateMiscellaneousItem(item.id, 'unit', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        className="border-gray-300 rounded-md shadow-sm sm:text-sm w-full"
                        value={item.unitRate || ''}
                        onChange={(e) => updateMiscellaneousItem(item.id, 'unitRate', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                      ${item.totalCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removeMiscellaneousItem(item.id)}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addMiscellaneousItem}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add Item
                    </Button>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Miscellaneous Steel Cost:
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ${currentEstimate.miscellaneousSteel.totalCost.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Total Miscellaneous Steel Cost</h3>
              <div className="text-xl font-bold text-blue-700">
                ${currentEstimate.miscellaneousSteel.totalCost.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Remarks */}
      <Card title="Remarks">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
          rows={4}
          value={currentEstimate.remarks}
          onChange={(e) => updateRemarks(e.target.value)}
          placeholder="Add any additional remarks or notes here..."
        />
      </Card>
      
      {/* Bottom Actions */}
      <div className="flex justify-end space-x-4 mt-6">
        <Button
          variant="outline"
          leftIcon={<FileDown className="h-5 w-5" />}
          onClick={handleExportPDF}
        >
          Export PDF
        </Button>
        <Button
          variant="outline"
          leftIcon={<FileDown className="h-5 w-5" />}
          onClick={handleExportExcel}
        >
          Export Excel
        </Button>
        <Button
          leftIcon={<FileText className="h-5 w-5" />}
          onClick={handleCreateQuotation}
        >
          Create Quotation
        </Button>
        <Button
          variant="primary"
          leftIcon={<Save className="h-5 w-5" />}
          onClick={() => id ? setShowRevisionDialog(true) : handleSave()}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default FrontSheet;