import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { FeatureSettings } from '@/lib/featureSettings';

type ResponseData = {
  success: boolean;
  data?: any;
  error?: string;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const settings: FeatureSettings = req.body;

    console.log('💾 Saving feature settings to Supabase:', settings);

    // Try to update existing settings (there should only be one row)
    const { data: existingData, error: fetchError } = await supabase
      .from('feature_settings')
      .select('id')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching existing settings:', fetchError);
      console.error('Error code:', fetchError.code, 'Message:', fetchError.message);
      // Even if table doesn't exist, try to insert (will fail appropriately)
      if (fetchError.code === 'PGRST116' || fetchError.message?.includes('not exist')) {
        // Table might not exist, try to insert
        console.log('⚠️ Assuming table needs creation or no rows exist');
      } else {
        return res.status(500).json({ success: false, error: `Database error: ${fetchError.message}` });
      }
    }

    let response;

    if (existingData && existingData.length > 0) {
      // Update existing settings
      const { data, error } = await supabase
        .from('feature_settings')
        .update({
          settings: settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingData[0].id)
        .select();

      response = { data, error };
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('feature_settings')
        .insert([
          {
            settings: settings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      response = { data, error };
    }

    if (response.error) {
      console.error('❌ Error saving settings:', response.error);
      return res.status(500).json({ success: false, error: 'Failed to save settings' });
    }

    console.log('✅ Settings saved successfully');
    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('❌ Exception in save-feature-settings:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
