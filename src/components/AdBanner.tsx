
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { useAuth } from '@/contexts/AuthContext';
import ProJamCard from '@/components/ProJamCard';
import { Badge } from '@/components/ui/badge';
import { AdsCampaignType } from '@/types/supabase';

interface AdBannerProps {
  cardIndex: number;
}

interface AdData {
  id: string;
  name: string;
  campaignType: string;
  redirectUrl: string | null;
  jamId: string | null;
  isPro: boolean;
  isSponsored: boolean;
  priceEuros: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

const AdBanner: React.FC<AdBannerProps> = ({ cardIndex }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [adData, setAdData] = useState<AdData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAd = async () => {
      setLoading(true);
      
      try {
        // Fetch active ad campaigns
        const { data, error } = await supabaseDirect.select<AdsCampaignType>(
          'ads_campaigns', 
          `
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
        `, 
          { status: 'active', is_visible: true }
        );
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          setAdData(null);
          return;
        }
        
        // Find ads that match the display frequency based on card index
        const matchingAds = data.filter((ad) => {
          return cardIndex % ad.display_frequency === 0;
        });
        
        if (matchingAds.length === 0) {
          setAdData(null);
          return;
        }
        
        // Randomly select an ad from matching ads
        const selectedAd = matchingAds[Math.floor(Math.random() * matchingAds.length)];
        
        const isPro = selectedAd.campaign_type === 'pro';
        const isSponsored = selectedAd.campaign_type === 'sponsored';
        
        // Always display the ad regardless of type or user authentication status
        setAdData({
          id: selectedAd.id,
          name: isPro ? selectedAd.name : selectedAd.jam?.name || 'Confiture',
          campaignType: selectedAd.campaign_type,
          redirectUrl: isPro ? selectedAd.redirect_url : null,
          jamId: (!isPro || isSponsored) ? selectedAd.jam_id : null,
          isPro: isPro || (selectedAd.jam?.is_pro || false),
          isSponsored: isSponsored,
          priceEuros: (!isPro || isSponsored) ? (selectedAd.jam?.price_euros || 0) : 0,
          isAvailable: (!isPro || isSponsored) ? (selectedAd.jam?.available_quantity > 0) : true,
          imageUrl: (!isPro || isSponsored) 
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
  
  const handleAdClick = async () => {
    if (!adData) return;
    
    try {
      // Record ad click with proper visitor type - Fix for non-authenticated users
      await supabaseDirect.insert('ads_clicks', {
        campaign_id: adData.id,
        source_page: location.pathname,
        is_authenticated: !!user,
        visitor_type: user ? 'authenticated' : 'visitor',
      });

      if (adData.redirectUrl) {
        window.open(adData.redirectUrl, '_blank', 'noopener,noreferrer');
      } else if (adData.jamId) {
        navigate(`/jam/${adData.jamId}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du clic:', error);
    }
  };
  
  if (loading || !adData) return null;

  // Pro campaign display
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
  
  // Sponsored jam or regular jam ad
  return (
    <div onClick={handleAdClick} className="cursor-pointer">
      <ProJamCard
        id={adData.jamId || ''}
        name={adData.name}
        imageUrl={adData.imageUrl || ''}
        priceEuros={adData.priceEuros}
        isPro={adData.isPro}
        isSponsored={adData.isSponsored}
        isAvailable={adData.isAvailable}
      />
    </div>
  );
};

export default AdBanner;
