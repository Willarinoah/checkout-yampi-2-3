import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createMemorial as createMemorialUtil, getMemorialBySlug } from '@/lib/memorial-utils';
import { sendMemorialEmail } from '@/lib/email-utils';
import type { MemorialFormData, UserConfig } from '@/types/database/memorial';
import { toast } from 'sonner';
import { generateMemorialUrl } from '@/lib/url-utils';

export const useMemorial = (slug?: string) => {
  const queryClient = useQueryClient();

  const { data: memorial, isLoading, error } = useQuery({
    queryKey: ['memorial', slug],
    queryFn: () => getMemorialBySlug(slug!),
    enabled: !!slug,
  });

  const createMemorial = useMutation({
    mutationFn: async (data: MemorialFormData) => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        throw new Error('User must be authenticated to create a memorial');
      }

      console.log('Creating memorial with session userId:', userId);

      const memorial = await createMemorialUtil(data);

      if (!memorial) {
        throw new Error('Failed to create memorial');
      }

      const memorialUrl = await generateMemorialUrl(data.couple_name);
      const qrCodeUrl = `${memorialUrl}/qr`;
      await sendMemorialEmail(data.email, memorialUrl, qrCodeUrl);
      
      return memorial;
    },
    onError: (error: Error) => {
      console.error('Error creating memorial:', error);
      toast.error('Error creating memorial. Please try again.');
    }
  });

  return {
    memorial,
    isLoading,
    error,
    createMemorial,
  };
};