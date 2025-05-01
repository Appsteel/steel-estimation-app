import React, { useEffect, useState } from 'react';
import { getAllEstimates } from '../services/supabaseClient';
import { EstimateData } from '../types/estimate';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from '../components/ui/Card';
import { FileSpreadsheet, FileText, DollarSign, Package } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const Dashboard: React.FC = () => {
  const [estimates, setEstimates] = useState<EstimateData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEstimates = async () => {
      const { data, error } = await getAllEstimates();
      
      if (!error && data) {
        setEstimates(data);
      }
      
      setLoading(false);
    };
    
    fetchEstimates();
  }, []);
  
  // Calculate totals
  const totalEstimates = estimates.length;
  const totalCost = estimates.reduce((sum, estimate) => sum + estimate.totalCost, 0);
  
  // Data for pie chart
  const pieData = [
    { name: 'Structural Steel', value: 0 },
    { name: 'Metal Deck', value: 0 },
    { name: 'Miscellaneous', value: 0 },
  ];
  
  // Data for monthly estimates count and section values
  const monthlyEstimates: Record<string, { count: number, structural: number, deck: number, misc: number }> = {};
  
  estimates.forEach((estimate) => {
    // Add to pie chart data
    if (estimate.structuralSteel.visible) {
      pieData[0].value += estimate.structuralSteel.totalCost;
    }
    
    if (estimate.metalDeck.visible) {
      pieData[1].value += estimate.metalDeck.totalCost;
    }
    
    if (estimate.miscellaneousSteel.visible) {
      pieData[2].value += estimate.miscellaneousSteel.totalCost;
    }
    
    // Add to monthly data
    if (estimate.created_at) {
      const date = new Date(estimate.created_at);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!monthlyEstimates[month]) {
        monthlyEstimates[month] = {
          count: 0,
          structural: 0,
          deck: 0,
          misc: 0
        };
      }
      
      monthlyEstimates[month].count += 1;
      if (estimate.structuralSteel.visible) {
        monthlyEstimates[month].structural += estimate.structuralSteel.totalCost;
      }
      if (estimate.metalDeck.visible) {
        monthlyEstimates[month].deck += estimate.metalDeck.totalCost;
      }
      if (estimate.miscellaneousSteel.visible) {
        monthlyEstimates[month].misc += estimate.miscellaneousSteel.totalCost;
      }
    }
  });
  
  // Convert monthly data to arrays for charts
  const monthlyCountData = Object.entries(monthlyEstimates).map(([month, data]) => ({
    month,
    count: data.count
  }));

  const monthlySectionData = Object.entries(monthlyEstimates).map(([month, data]) => ({
    month,
    'Structural Steel': data.structural,
    'Metal Deck': data.deck,
    'Miscellaneous': data.misc
  }));
  
  // Calculate the percentage breakdown
  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center">
                <FileSpreadsheet className="h-10 w-10 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Estimates</p>
                  <p className="text-2xl font-semibold">{totalEstimates}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center">
                <DollarSign className="h-10 w-10 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-100">Total Value</p>
                  <p className="text-2xl font-semibold">${totalCost.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center">
                <Package className="h-10 w-10 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-100">Avg. Structural Cost</p>
                  <p className="text-2xl font-semibold">
                    ${Math.round(pieData[0].value / (totalEstimates || 1)).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center">
                <FileText className="h-10 w-10 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-100">Avg. Total Cost</p>
                  <p className="text-2xl font-semibold">
                    ${Math.round(totalCost / (totalEstimates || 1)).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="Cost Breakdown">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card title="Monthly Estimates Count">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyCountData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" name="Number of Estimates" stroke="#3B82F6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Monthly Section Values">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySectionData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="Structural Steel" stackId="a" fill="#0088FE" />
                    <Bar dataKey="Metal Deck" stackId="a" fill="#00C49F" />
                    <Bar dataKey="Miscellaneous" stackId="a" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          {/* Recent estimates */}
          <Card title="Recent Estimates">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estimates.slice(0, 5).map((estimate) => (
                    <tr key={estimate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {estimate.projectInfo.quoteNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {estimate.projectInfo.projectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {estimate.projectInfo.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${estimate.totalCost.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;