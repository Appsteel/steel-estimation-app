import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initSupabase } from './services/supabaseClient';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SummarySheet from './pages/SummarySheet';
import FrontSheet from './pages/FrontSheet';
import QuotationLetter from './pages/QuotationLetter';
import { useEstimateStore } from './store/estimateStore';

function App() {
  const { setInitialized } = useEstimateStore();

  useEffect(() => {
    // Initialize Supabase
    initSupabase();
    setInitialized(true);
  }, [setInitialized]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/summary" element={<SummarySheet />} />
          <Route path="/front-sheet" element={<FrontSheet />} />
          <Route path="/front-sheet/:id" element={<FrontSheet />} />
          <Route path="/quotation/:id" element={<QuotationLetter />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;