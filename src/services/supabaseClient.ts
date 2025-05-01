import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EstimateData } from '../types/estimate';

let supabase: SupabaseClient | null = null;

export function initSupabase() {
  // Initialize Supabase with environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in environment variables');
    return null;
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    return initSupabase() as SupabaseClient;
  }
  return supabase;
}

export async function getNextQuoteNumber(): Promise<string> {
  const supabase = getSupabase();
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `${yy}${mm}-`;
  
  try {
    // Get all quotes for current month, ordered by quote number
    const { data, error } = await supabase
      .from('estimates')
      .select('projectInfo')
      .like('projectInfo->>quoteNumber', `${prefix}%`)
      .order('projectInfo->>quoteNumber', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      // No quotes for this month, start with 01
      return `${prefix}01`;
    }

    // Find the first gap in the sequence or get the next number
    let expectedNumber = 1;
    for (const estimate of data) {
      const currentNumber = parseInt(estimate.projectInfo.quoteNumber.split('-')[1]);
      if (currentNumber !== expectedNumber) {
        // Found a gap, use this number
        return `${prefix}${expectedNumber.toString().padStart(2, '0')}`;
      }
      expectedNumber++;
    }

    // No gaps found, use the next number in sequence
    return `${prefix}${expectedNumber.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error getting next quote number:', error);
    // Fallback to a timestamp-based number in case of error
    return `${prefix}01`;
  }
}

export async function saveEstimate(estimate: EstimateData): Promise<{ success: boolean; error?: string; id?: string }> {
  const supabase = getSupabase();
  
  try {
    // If this is a new estimate, get the next quote number
    if (!estimate.id) {
      estimate.projectInfo.quoteNumber = await getNextQuoteNumber();
    }

    const { data, error } = await supabase
      .from('estimates')
      .upsert(estimate)
      .select('id');

    if (error) throw error;
    
    return { success: true, id: data?.[0]?.id };
  } catch (error) {
    console.error('Error saving estimate:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteEstimate(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  
  try {
    const { error } = await supabase
      .from('estimates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting estimate:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getEstimate(id: string): Promise<{ data?: EstimateData; error?: string }> {
  const supabase = getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return { data: data as EstimateData };
  } catch (error) {
    console.error('Error getting estimate:', error);
    return { error: (error as Error).message };
  }
}

export async function getAllEstimates(): Promise<{ data?: EstimateData[]; error?: string }> {
  const supabase = getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data: data as EstimateData[] };
  } catch (error) {
    console.error('Error getting all estimates:', error);
    return { error: (error as Error).message };
  }
}

export async function updateEstimateNotes(id: string, notes: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  
  try {
    const { error } = await supabase
      .from('estimates')
      .update({ notes })
      .eq('id', id);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating estimate notes:', error);
    return { success: false, error: (error as Error).message };
  }
}