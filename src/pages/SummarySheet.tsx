import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEstimates, updateEstimateNotes } from '../services/supabaseClient';
import { EstimateData } from '../types/estimate';
import Table from '../components/ui/Table';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FilePenLine, Search, CircleDollarSign, Settings } from 'lucide-react';

interface ColumnVisibility {
  [key: string]: boolean;
}

const SummarySheet: React.FC = () => {
  const [estimates, setEstimates] = useState<EstimateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    notes: true,
    quoteNumber: true,
    project: true,
    customer: true,
    totalPrice: true,
    closingDate: false,
    architect: false,
    engineer: false,
    structuralSteel: false,
    metalDeck: false,
    miscellaneous: false,
    weight: false,
    actions: true,
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchEstimates();
  }, []);
  
  const fetchEstimates = async () => {
    setLoading(true);
    const { data, error } = await getAllEstimates();
    
    if (!error && data) {
      setEstimates(data);
    }
    
    setLoading(false);
  };
  
  const handleNotesChange = async (id: string, notes: string) => {
    const { success } = await updateEstimateNotes(id, notes);
    
    if (success) {
      setEstimates(prevEstimates => 
        prevEstimates.map(estimate => 
          estimate.id === id ? { ...estimate, notes } : estimate
        )
      );
    }
  };

  const allColumns = [
    {
      id: 'notes',
      header: 'Notes',
      accessor: (row: EstimateData) => (
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[60px] resize-none text-sm"
          value={row.notes || ''}
          onChange={(e) => handleNotesChange(row.id as string, e.target.value)}
          placeholder="Add notes..."
          onClick={(e) => e.stopPropagation()}
        />
      ),
      className: 'w-48',
    },
    {
      id: 'quoteNumber',
      header: 'Quote #',
      accessor: (row: EstimateData) => row.projectInfo.quoteNumber,
      className: 'w-24',
    },
    {
      id: 'project',
      header: 'Project',
      accessor: (row: EstimateData) => (
        <div>
          <div className="font-medium">{row.projectInfo.projectName}</div>
          <div className="text-xs text-gray-500">{row.projectInfo.projectAddress}</div>
        </div>
      ),
      className: 'w-48',
    },
    {
      id: 'customer',
      header: 'Customer',
      accessor: (row: EstimateData) => (
        <div>
          <div>{row.projectInfo.gcName}</div>
          <div className="text-xs text-gray-500">{row.projectInfo.contactPerson}</div>
        </div>
      ),
      className: 'w-40',
    },
    {
      id: 'closingDate',
      header: 'Closing Date',
      accessor: (row: EstimateData) => row.projectInfo.closingDate,
      className: 'w-32',
    },
    {
      id: 'architect',
      header: 'Architect',
      accessor: (row: EstimateData) => (
        <div>
          <div>{row.projectInfo.architect}</div>
          <div className="text-xs text-gray-500">{row.projectInfo.architectPhone}</div>
        </div>
      ),
      className: 'w-40',
    },
    {
      id: 'engineer',
      header: 'Engineer',
      accessor: (row: EstimateData) => (
        <div>
          <div>{row.projectInfo.engineer}</div>
          <div className="text-xs text-gray-500">{row.projectInfo.engineerPhone}</div>
        </div>
      ),
      className: 'w-40',
    },
    {
      id: 'totalPrice',
      header: 'Total Price',
      accessor: (row: EstimateData) => `$${row.totalCost.toLocaleString()}`,
      className: 'w-28 text-right font-medium',
    },
    {
      id: 'structuralSteel',
      header: 'Structural Steel',
      accessor: (row: EstimateData) => 
        row.structuralSteel.visible 
          ? `$${row.structuralSteel.totalCost.toLocaleString()}` 
          : 'N/A',
      className: 'w-32 text-right',
    },
    {
      id: 'metalDeck',
      header: 'Metal Deck',
      accessor: (row: EstimateData) => 
        row.metalDeck.visible 
          ? `$${row.metalDeck.totalCost.toLocaleString()}` 
          : 'N/A',
      className: 'w-32 text-right',
    },
    {
      id: 'miscellaneous',
      header: 'Miscellaneous',
      accessor: (row: EstimateData) => 
        row.miscellaneousSteel.visible 
          ? `$${row.miscellaneousSteel.totalCost.toLocaleString()}` 
          : 'N/A',
      className: 'w-32 text-right',
    },
    {
      id: 'weight',
      header: 'Weight (Tons)',
      accessor: (row: EstimateData) => 
        row.structuralSteel.visible 
          ? row.structuralSteel.totalTons.toFixed(2)
          : 'N/A',
      className: 'w-28 text-right',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (row: EstimateData) => (
        <div className="flex flex-col gap-1">
          <Button 
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/front-sheet/${row.id}`);
            }}
            leftIcon={<Search className="h-3 w-3" />}
          >
            View
          </Button>
          <Button 
            size="xs"
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/quotation/${row.id}`);
            }}
            leftIcon={<CircleDollarSign className="h-3 w-3" />}
          >
            Quote
          </Button>
        </div>
      ),
      className: 'w-16',
    },
  ];

  const visibleColumns = allColumns.filter(col => columnVisibility[col.id]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Summary Sheet</h1>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            leftIcon={<Settings className="h-5 w-5" />}
          >
            Column Settings
          </Button>
          <Button 
            onClick={() => navigate('/front-sheet')}
            leftIcon={<FilePenLine className="h-5 w-5" />}
          >
            New Estimate
          </Button>
        </div>
      </div>

      {/* Column Settings Dropdown */}
      {showColumnSettings && (
        <Card className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allColumns.map(column => (
              <label key={column.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={columnVisibility[column.id]}
                  onChange={(e) => setColumnVisibility(prev => ({
                    ...prev,
                    [column.id]: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{column.header}</span>
              </label>
            ))}
          </div>
        </Card>
      )}
      
      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Table
            columns={visibleColumns}
            data={estimates}
            keyField="id"
            onRowClick={(row) => navigate(`/front-sheet/${row.id}`)}
            resizable
          />
        )}
      </Card>
    </div>
  );
};

export default SummarySheet;