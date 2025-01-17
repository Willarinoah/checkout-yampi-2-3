import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemorial } from "@/hooks/useMemorial";
import { Button } from '@/components/ui/button';
import { MemorialPreview } from '@/components/memorial/MemorialPreview';
import { useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import debounce from 'lodash/debounce';

const PreviewMemorial: React.FC = () => {
  const { slug } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { memorial, isLoading, error } = useMemorial(slug);

  // Função para registrar a visualização
  const registerView = async (memorialId: string) => {
    // Verificar se já registramos esta visualização nesta sessão
    const sessionKey = `memorial_view_${memorialId}`;
    if (sessionStorage.getItem(sessionKey)) {
      console.log('View already registered in this session');
      return;
    }

    try {
      // Coletar informações básicas do dispositivo
      const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: {
          width: window.screen.width,
          height: window.screen.height
        }
      };

      const { error: analyticsError } = await supabase
        .from('analytics_data')
        .insert([
          {
            memorial_id: memorialId,
            device_info: deviceInfo,
          }
        ]);

      if (analyticsError) {
        console.error('Error registering view:', analyticsError);
        return;
      }

      // Marcar como registrado nesta sessão
      sessionStorage.setItem(sessionKey, 'true');
      console.log('View registered successfully');
    } catch (err) {
      console.error('Error in analytics:', err);
    }
  };

  // Criar versão com debounce da função
  const debouncedRegisterView = debounce(registerView, 1000);

  useEffect(() => {
    if (memorial?.id && memorial.payment_status === 'paid') {
      debouncedRegisterView(memorial.id);
    }
    // Cleanup function para cancelar debounce pendente
    return () => {
      debouncedRegisterView.cancel();
    };
  }, [memorial?.id]);

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