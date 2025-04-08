
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import ProJamCard from '@/components/ProJamCard';

interface AdBannerProps {
  cardIndex: number;
}

const AdBanner: React.FC<AdBannerProps> = ({ cardIndex }) => {
  const location = useLocation();
  const [adData, setAdData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAd = async () => {
      setLoading(true);
      
      try {
        // Chercher une campagne active et visible en utilisant supabaseDirect
        const { data, error } = await supabaseDirect.select('ads_campaigns', `
          id,
          display_frequency,
          jam_id,
          campaign_type,
          jam:jam_id (
            id,
            name,
            price_euros,
            is_pro,
            available_quantity,
            jam_images(url, is_primary)
          )
        `, { status: 'active', is_visible: true });
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          setAdData(null);
          return;
        }
        
        // Choisir une pub qui correspond à la fréquence d'affichage
        const matchingAds = data.filter((ad: any) => {
          return cardIndex % ad.display_frequency === 0;
        });
        
        if (matchingAds.length === 0) {
          setAdData(null);
          return;
        }
        
        // Sélectionner aléatoirement une pub parmi celles qui correspondent
        const selectedAd = matchingAds[Math.floor(Math.random() * matchingAds.length)];
        
        // Préparer les données pour l'affichage
        setAdData({
          id: selectedAd.id,
          jamId: selectedAd.jam_id,
          name: selectedAd.jam?.name || 'Confiture',
          isPro: selectedAd.jam?.is_pro || selectedAd.campaign_type === 'pro',
          isSponsored: selectedAd.campaign_type === 'sponsored',
          priceEuros: selectedAd.jam?.price_euros || 0,
          isAvailable: selectedAd.jam?.available_quantity > 0,
          imageUrl: selectedAd.jam?.jam_images?.find((img: any) => img.is_primary)?.url ||
                   selectedAd.jam?.jam_images?.[0]?.url
        });
        
      } catch (error: any) {
        console.error('Erreur lors du chargement de la publicité:', error);
        setAdData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAd();
  }, [cardIndex, location.pathname]);
  
  // Enregistrer un clic sur la pub
  const handleAdClick = async () => {
    if (!adData) return;
    
    try {
      await supabaseDirect.insert('ads_clicks', {
        campaign_id: adData.id,
        source_page: location.pathname,
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du clic:', error);
    }
  };
  
  if (loading || !adData) return null;
  
  return (
    <div onClick={handleAdClick}>
      <ProJamCard
        id={adData.jamId}
        name={adData.name}
        imageUrl={adData.imageUrl}
        priceEuros={adData.priceEuros}
        isPro={adData.isPro}
        isSponsored={adData.isSponsored}
        isAvailable={adData.isAvailable}
      />
    </div>
  );
};

export default AdBanner;
