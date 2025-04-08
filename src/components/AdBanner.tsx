
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import ProJamCard from '@/components/ProJamCard';
import { Badge } from '@/components/ui/badge';

interface AdBannerProps {
  cardIndex: number;
}

const AdBanner: React.FC<AdBannerProps> = ({ cardIndex }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adData, setAdData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAd = async () => {
      setLoading(true);
      
      try {
        // Chercher une campagne active et visible en utilisant supabaseDirect
        const { data, error } = await supabaseDirect.select('ads_campaigns', `
          id,
          name,
          display_frequency,
          jam_id,
          campaign_type,
          redirect_url,
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
        const isPro = selectedAd.campaign_type === 'pro';
        
        setAdData({
          id: selectedAd.id,
          name: isPro ? selectedAd.name : selectedAd.jam?.name || 'Confiture',
          campaignType: selectedAd.campaign_type,
          redirectUrl: isPro ? selectedAd.redirect_url : null,
          jamId: !isPro ? selectedAd.jam_id : null,
          isPro: isPro || (selectedAd.jam?.is_pro || false),
          isSponsored: true,
          priceEuros: !isPro ? (selectedAd.jam?.price_euros || 0) : 0,
          isAvailable: !isPro ? (selectedAd.jam?.available_quantity > 0) : true,
          imageUrl: !isPro 
            ? (selectedAd.jam?.jam_images?.find((img: any) => img.is_primary)?.url ||
               selectedAd.jam?.jam_images?.[0]?.url) 
            : null
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

      if (adData.redirectUrl) {
        // Open external URL for pro campaigns in a new tab
        window.open(adData.redirectUrl, '_blank', 'noopener,noreferrer');
      } else if (adData.jamId) {
        // Navigate to jam page for sponsored campaigns
        navigate(`/jam/${adData.jamId}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du clic:', error);
    }
  };
  
  if (loading || !adData) return null;

  // Professional ad without jam
  if (adData.campaignType === 'pro') {
    return (
      <div onClick={handleAdClick} className="cursor-pointer">
        <div className="relative rounded-lg border border-muted overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className="text-center">
              <Badge variant="outline" className="mb-4 bg-white">Publicité</Badge>
              <h3 className="text-xl font-semibold mb-2">{adData.name}</h3>
              <p className="text-muted-foreground text-sm">Cliquez pour en savoir plus</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Contenu sponsorisé</span>
              <Badge variant="secondary">Pro</Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular sponsored jam
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
