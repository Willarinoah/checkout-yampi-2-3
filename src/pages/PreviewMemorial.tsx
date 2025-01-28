import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from '@/components/ui/button';
import { MemorialPreview } from '@/components/memorial/MemorialPreview';
import { useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { YampiMemorial, StripeMemorial } from '@/lib/memorial-data-utils';

const PreviewMemorial: React.FC = () => {
  const { slug } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [memorial, setMemorial] = React.useState<YampiMemorial | StripeMemorial | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        setIsLoading(true);
        
        // Try yampi_memorials first
        const { data: yampiMemorial } = await supabase
          .from('yampi_memorials')
          .select('*')
          .eq('custom_slug', slug)
          .single();

        // If not found, try stripe_memorials
        if (!yampiMemorial) {
          const { data: stripeMemorial } = await supabase
            .from('stripe_memorials')
            .select('*')
            .eq('custom_slug', slug)
            .single();
          
          if (stripeMemorial) {
            setMemorial(stripeMemorial);
          }
        } else {
          setMemorial(yampiMemorial);
        }

      } catch (err) {
        console.error('Error fetching memorial:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch memorial'));
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchMemorial();
    }
  }, [slug]);

  useEffect(() => {
    if (memorial && memorial.payment_status === 'pending') {
      console.log('Memorial access denied - Payment pending:', memorial);
      toast.error(t("memorial_not_available"));
      navigate('/');
    }
  }, [memorial, navigate, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-loveblue text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !memorial || memorial.payment_status === 'pending') {
    return (
      <div className="min-h-screen bg-loveblue text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t("memorial_not_found")}</h1>
          <p className="text-gray-400 mb-6">{t("check_url")}</p>
          <Button
            variant="outline"
            className="bg-lovepink hover:bg-lovepink/90 text-white border-none"
            onClick={() => navigate('/')}
          >
            {t("back_to_home")}
          </Button>
        </div>
      </div>
    );
  }

  const selectedPlan = memorial.plan_type === "1 year, 3 photos and no music" ? "basic" : "premium";

  return (
    <div className="min-h-screen bg-loveblue text-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <MemorialPreview
          coupleName={memorial.couple_name}
          photos={memorial.photos || []}
          message={memorial.message || undefined}
          youtubeUrl={memorial.youtube_url || undefined}
          selectedPlan={selectedPlan}
          isPreview={false}
          startDate={memorial.relationship_start ? new Date(memorial.relationship_start) : undefined}
          startTime={memorial.time}
        />
        
        <div className="text-center">
          <Button
            variant="outline"
            className="bg-lovepink hover:bg-lovepink/90 text-white border-none"
            onClick={() => navigate('/create')}
          >
            {t("create_website")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewMemorial;