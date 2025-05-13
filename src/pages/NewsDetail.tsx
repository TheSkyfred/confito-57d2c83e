import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  Calendar, 
  Edit,
  Share,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  content: string;
  cover_image_url?: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: 'draft' | 'published' | 'archived';
}

interface NewsImage {
  id: string;
  news_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

// Fonction utilitaire pour valider le statut
const validateNewsStatus = (status: string): 'draft' | 'published' | 'archived' => {
  if (status === 'draft' || status === 'published' || status === 'archived') {
    return status;
  }
  return 'draft'; // Valeur par défaut si le statut n'est pas valide
};

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isModerator } = useUserRole();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [newsImages, setNewsImages] = useState<NewsImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Récupérer les détails de l'actualité
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        // Validation du statut
        const validatedData: NewsItem = {
          ...data,
          status: validateNewsStatus(data.status)
        };

        // Si l'actualité n'est pas publiée et que l'utilisateur n'est pas admin/modérateur, rediriger
        if (validatedData.status !== 'published' && !isAdmin && !isModerator) {
          navigate('/news');
          toast({
            title: "Accès refusé",
            description: "Cette actualité n'est pas disponible.",
            variant: "destructive"
          });
          return;
        }

        setNewsItem(validatedData);

        // Récupérer les images associées
        const { data: imagesData, error: imagesError } = await supabase
          .from('news_images')
          .select('*')
          .eq('news_id', id)
          .order('created_at');

        if (imagesError) {
          throw imagesError;
        }

        setNewsImages(imagesData || []);
      } catch (error: any) {
        console.error('Erreur lors du chargement de l\'actualité:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger cette actualité",
          variant: "destructive"
        });
        navigate('/news');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [id, navigate, toast, isAdmin, isModerator]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newsItem?.title || 'Actualité Confito',
        text: newsItem?.summary || 'Découvrez cette actualité sur Confito',
        url: window.location.href,
      })
      .catch(error => console.error('Erreur de partage:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien de l'actualité a été copié dans le presse-papier.",
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Chargement de l'actualité...</p>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Cette actualité n'existe pas ou a été supprimée.</p>
        <Button asChild className="mt-4">
          <Link to="/news">Retour aux actualités</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/news">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour aux actualités
            </Link>
          </Button>
          
          {(isAdmin || isModerator) && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/news/edit/${id}`}>
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Link>
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4 mr-1" />
            Partager
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-3">{newsItem.title}</h1>
          
          {newsItem.summary && (
            <p className="text-lg text-muted-foreground mb-4">{newsItem.summary}</p>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{format(new Date(newsItem.published_at), 'PPP', { locale: fr })}</span>
          </div>
        </div>

        {newsItem.cover_image_url && (
          <div className="mb-8">
            <img
              src={newsItem.cover_image_url}
              alt={newsItem.title}
              className="w-full rounded-lg object-cover aspect-video"
            />
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              {/* Afficher le contenu avec des sauts de ligne */}
              {newsItem.content.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
              ))}
              
              {/* Afficher les images supplémentaires */}
              {newsImages.length > 0 && (
                <div className="mt-8">
                  <Separator className="my-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {newsImages.map(image => (
                      <div key={image.id} className="space-y-2">
                        <img
                          src={image.image_url}
                          alt={image.caption || "Image d'illustration"}
                          className="w-full rounded-lg object-cover"
                        />
                        {image.caption && (
                          <p className="text-sm text-muted-foreground italic text-center">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsDetail;
