import { supabase } from "@/integrations/supabase/client";

export const recordVisit = async (memorialId: string, visitorLocation: any, deviceInfo: any) => {
  try {
    const { data, error } = await supabase
      .from('analytics_data')
      .insert({
        memorial_id: memorialId,
        visitor_location: visitorLocation,
        device_info: deviceInfo
      });

    if (error) {
      console.error('Error recording visit:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in recordVisit:', error);
    throw error;
  }
};