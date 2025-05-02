import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEstimate } from '../services/supabaseClient';
import { EstimateData, MiscellaneousItem } from '../types/estimate';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { downloadAsPDF, downloadAsExcel } from '../utils/exportUtils';
import { FileDown, ArrowLeft } from 'lucide-react';

const COMPANY_ADDRESS = '323 Deerhurst Drive, Brampton, Ontario. L6T 5K3';

const QuotationLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [structuralDescription, setStructuralDescription] = useState('');
  const [metalDeckDescription, setMetalDeckDescription] = useState('');
  const [miscellaneousDescription, setMiscellaneousDescription] = useState('');
  const [additionalDescription, setAdditionalDescription] = useState('');
  const [miscItems, setMiscItems] = useState<MiscellaneousItem[]>([]);
  
  useEffect(() => {
    if (!id) {
      navigate('/summary');
      return;
    }
    
    const fetchEstimate = async () => {
      setLoading(true);
      const { data, error } = await getEstimate(id);
      
      if (!error && data) {
        setEstimate(data);
        
        if (data.miscellaneousSteel.visible) {
          setMiscItems(data.miscellaneousSteel.items.map(item => ({
            ...item,
            refDrawing: ''
          })));
        }
      } else {
        navigate('/summary');
      }
      
      setLoading(false);
    };
    
    fetchEstimate();
  }, [id, navigate]);
  
  const handleRefDrawingChange = (id: string, value: string) => {
    setMiscItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, refDrawing: value } : item
      )
    );
  };
  
  const handleExportPDF = () => {
    if (estimate) {
      const quoteData = {
        ...estimate,
        quotation: {
          structuralDescription,
          metalDeckDescription,
          miscellaneousDescription,
          additionalDescription,
          miscItems
        }
      };
      downloadAsPDF(quoteData, 'quotation');
    }
  };
  
  const handleExportExcel = () => {
    if (estimate) {
      const quoteData = {
        ...estimate,
        quotation: {
          structuralDescription,
          metalDeckDescription,
          miscellaneousDescription,
          additionalDescription,
          miscItems
        }
      };
      downloadAsExcel(quoteData, 'quotation');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!estimate) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Estimate not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/summary')}
          leftIcon={<ArrowLeft className="h-5 w-5" />}
        >
          Back to Summary
        </Button>
      </div>
    );
  }
  
  const { projectInfo, structuralSteel, metalDeck, miscellaneousSteel } = estimate;
  
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotation Letter</h1>
          <p className="text-gray-500">
            Quote #: {projectInfo.quoteNumber}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-5 w-5" />}
            onClick={() => navigate(`/front-sheet/${id}`)}
          >
            Back to Front Sheet
          </Button>
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
        </div>
      </div>
      
      <Card className="prose max-w-none">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <img 
                src="/logo.png" 
                alt="Company Logo" 
                className="h-16 object-contain"
              />
              <p className="text-sm text-gray-600 mt-2">{COMPANY_ADDRESS}</p>
            </div>
            <p className="text-right">{projectInfo.date}</p>
          </div>
          
          <p className="font-semibold">{projectInfo.gcName}</p>
          <p>{projectInfo.gcAddress}</p>
          
          <p className="mt-4">Attention: {projectInfo.contactPerson}</p>
          
          <h2 className="text-xl font-bold mt-6">Re: {projectInfo.projectName}</h2>
          <p>{projectInfo.projectAddress}</p>
        </div>
        
        <p className="mb-4">
          Dear {projectInfo.contactPerson},
        </p>
        
        <p className="mb-4">
          We are pleased to submit our quotation for the supply and installation of structural steel
          {metalDeck.visible ? ' and metal deck' : ''} as per referenced drawings:
        </p>
        
        <ul className="list-disc pl-5 mb-4">
          {projectInfo.structuralDrawings && (
            <li>
              {projectInfo.structuralDrawings} dated {projectInfo.structuralDrawingsDate}
              {projectInfo.structuralDrawingsRevision && ` (Rev. ${projectInfo.structuralDrawingsRevision})`}
            </li>
          )}
          {projectInfo.architecturalDrawings && (
            <li>
              {projectInfo.architecturalDrawings} dated {projectInfo.architecturalDrawingsDate}
              {projectInfo.architecturalDrawingsRevision && ` (Rev. ${projectInfo.architecturalDrawingsRevision})`}
            </li>
          )}
        </ul>
        
        <div className="space-y-6">
          {structuralSteel.visible && (
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Structural Steel</h3>
                <span className="font-semibold">${(structuralSteel.overriddenTotalCost ?? structuralSteel.totalCost).toLocaleString()}</span>
              </div>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                rows={3}
                value={structuralDescription}
                onChange={(e) => setStructuralDescription(e.target.value)}
                placeholder="Add description for structural steel..."
              />
            </div>
          )}
          
          {metalDeck.visible && (
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Metal Deck</h3>
                <span className="font-semibold">${(metalDeck.overriddenTotalCost ?? metalDeck.totalCost).toLocaleString()}</span>
              </div>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                rows={3}
                value={metalDeckDescription}
                onChange={(e) => setMetalDeckDescription(e.target.value)}
                placeholder="Add description for metal deck..."
              />
            </div>
          )}
          
          {miscellaneousSteel.visible && (
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Miscellaneous Steel</h3>
                <span className="font-semibold">${(miscellaneousSteel.overriddenTotalCost ?? miscellaneousSteel.totalCost).toLocaleString()}</span>
              </div>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                rows={3}
                value={miscellaneousDescription}
                onChange={(e) => setMiscellaneousDescription(e.target.value)}
                placeholder="Add description for miscellaneous steel..."
              />
            </div>
          )}
        </div>
        
        {miscItems.length > 0 && (
          <div className="mb-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Miscellaneous Steel Items</h3>
            
            <div className="overflow-x-auto">
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
                      Ref. Dwg.
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {miscItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          className="border-gray-300 rounded-md shadow-sm sm:text-sm"
                          value={item.refDrawing || ''}
                          onChange={(e) => handleRefDrawingChange(item.id, e.target.value)}
                          placeholder="Reference"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Description
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
            rows={4}
            value={additionalDescription}
            onChange={(e) => setAdditionalDescription(e.target.value)}
            placeholder="Add additional details here..."
          />
        </div>
        
        <p className="mb-4">All prices are exclusive of H.S.T.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-2">Qualifications:</h3>
          <ul className="list-disc pl-5">
            <li>All materials to receive one coat of commercial grey primer as per CISC/CPMA 1-73a standard.</li>
            <li>Area to be free and clear of any obstruction before installation can commence.</li>
            <li>One mobilization allowed for each scope: structural steel, steel deck and miscellaneous steel.</li>
            <li>This quotation is to be read in conjunction with attached Appendix A.</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Exclusions:</h3>
          <p>
            Finish paint, insulation, fireproofing, galvanizing unless noted, metal stud framing, shoring, rebar, wood blocking, concrete scanning, Lateral connections to precast wall/glazing/imp wall panel, testing and inspection.
          </p>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Delivery:</h3>
          <p>To be arranged.</p>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Terms:</h3>
          <p>
            Net 30 days from date of invoice. Subject to progress invoicing. Supply of material may be invoice separately, 10% holdback applies to installation portion only and it is due within 60 days from date of substantial completion of our portion of the scope.
          </p>
        </div>
        
        <p className="mb-6">
          Trusting the above meets with your approval, we look forward to working with you.
        </p>
        
        <p className="mb-2">Yours truly,</p>
        <p className="font-semibold">{projectInfo.estimator}</p>
      </Card>
    </div>
  );
};

export default QuotationLetter;
