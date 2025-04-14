
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useUserRole } from '@/hooks/useUserRole';
import {
  CalendarDays,
  ChevronRight,
  Trophy,
  Search,
  Filter,
  Newspaper,
  Clock,
  Calendar,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BattleResultType, NewBattleType, ProfileType } from '@/types/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import NewsItem from '@/components/news/NewsItem';
import BattleResultNewsItem from '@/components/news/BattleResultNewsItem';

const News = () => {
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<any[]>([]);
  const [battleResults, setBattleResults] = useState<(BattleResultType & { 
    battle?: NewBattleType;
    winner?: ProfileType;
    participant_a?: ProfileType;
    participant_b?: ProfileType;
  })[]>([]);

  useEffect(() => {
    const fetchNewsData = async () => {
      setLoading(true);
      try {
        // Fetch battle results with related data
        const { data: resultsData, error: resultsError } = await supabase
          .from('battle_results')
          .select(`
            *,
            winner:winner_id(username, avatar_url),
            battle:battle_id(
              *
            ),
            participant_a:participant_a_id(username, avatar_url),
            participant_b:participant_b_id(username, avatar_url)
          `)
          .order('created_at', { ascending: false });

        if (resultsError) throw resultsError;
        
        // Properly cast the result to match our expected type
        const typedResults = (resultsData || []) as (BattleResultType & { 
          battle?: NewBattleType;
          winner?: ProfileType;
          participant_a?: ProfileType;
          participant_b?: ProfileType;
        })[];
        
        setBattleResults(typedResults);

        // Here you would fetch other types of news as well
        // For example, advice articles, new features, etc.
        const { data: adviceData, error: adviceError } = await supabase
          .from('advice_articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(5);
        
        if (adviceError) throw adviceError;
        
        // Combine all news items into a single array
        // Add a 'type' field to differentiate between different types of news
        const combinedNews = [
          ...(typedResults || []).map(result => ({ 
            ...result, 
            type: 'battle_result', 
            date: result.created_at 
          })),
          ...(adviceData || []).map(advice => ({ 
            ...advice, 
            type: 'advice', 
            date: advice.published_at 
          }))
        ];
        
        // Sort by date, most recent first
        combinedNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setNews(combinedNews);
      } catch (error: any) {
        console.error('Error fetching news data:', error.message);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les actualités',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [toast]);

  const filteredNews = news.filter(item => {
    // Return true if we match the active tab filter
    if (activeTab !== 'all' && item.type !== activeTab) {
      return false;
    }

    // Apply search query if any
    if (searchQuery) {
      if (item.type === 'battle_result' && item.battle) {
        return item.battle.theme.toLowerCase().includes(searchQuery.toLowerCase());
      } else if (item.type === 'advice') {
        return item.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    }
    
    return true;
  });

  const renderNewsItem = (item: any) => {
    switch (item.type) {
      case 'battle_result':
        return <BattleResultNewsItem key={item.id} result={item} />;
      case 'advice':
        return <NewsItem 
          key={item.id}
          title={item.title}
          date={item.published_at}
          image={item.cover_image_url}
          content={item.content}
          type="article"
          url={`/conseils/${item.id}`}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Actualités</h1>
          <p className="text-muted-foreground mt-2">
            Restez à jour avec les derniers résultats des battles et autres nouvelles de la communauté.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les actualités..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="battle_result">Résultats</TabsTrigger>
                <TabsTrigger value="advice">Articles</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Chargement des actualités...</p>
            </div>
          ) : filteredNews.length > 0 ? (
            <div className="space-y-6">
              {filteredNews.map(renderNewsItem)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Newspaper className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchQuery
                    ? "Aucun résultat ne correspond à votre recherche."
                    : "Aucune actualité disponible pour le moment."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Événements à venir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                {/* This would be populated with upcoming events */}
                <p className="text-muted-foreground text-center py-2">
                  Aucun événement prévu pour le moment.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/battles">
                  Voir tous les battles
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Derniers gagnants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {battleResults.slice(0, 3).map((result) => (
                  <div key={result.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {result.winner?.avatar_url ? (
                        <img
                          src={result.winner.avatar_url}
                          alt={result.winner.username}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <Trophy className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{result.winner?.username || 'Utilisateur'}</p>
                      <p className="text-xs text-muted-foreground">
                        Battle: {result.battle?.theme || 'Battle'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {battleResults.length === 0 && (
                  <p className="text-muted-foreground text-center py-2">
                    Aucun résultat de battle disponible.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Administration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link to="/admin/battles">
                      Gérer les battles
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/admin/conseils">
                      Gérer les articles
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
