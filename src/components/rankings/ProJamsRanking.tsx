
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal } from 'lucide-react';

interface Jam {
  id: string;
  name: string;
  creator_id: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
  jam_images: Array<{
    url: string;
  }>;
  review_count: number;
  avg_rating: number;
  price_euros?: number;
  is_pro: boolean;
}

interface ProJamsRankingProps {
  jams: Jam[] | undefined;
  isLoading: boolean;
}

const getJamRankBadge = (index: number) => {
  switch (index) {
    case 0:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 1:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 2:
      return <Medal className="h-6 w-6 text-amber-700" />;
    default:
      return <Badge variant="outline">{index + 1}</Badge>;
  }
};

const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
  if (value === undefined || value === null) return '0.0';
  return value.toFixed(digits);
};

const ProJamsRanking: React.FC<ProJamsRankingProps> = ({ jams, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jams?.map((jam: Jam, index: number) => (
        <Card key={jam.id} className={index < 3 ? "border-jam-honey" : ""}>
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="flex items-center justify-center w-10 mr-4">
                {getJamRankBadge(index)}
              </div>
              <div className="flex-shrink-0 mr-4">
                <img 
                  src={jam.jam_images?.[0]?.url || '/placeholder.svg'} 
                  alt={jam.name}
                  className="h-16 w-16 object-cover rounded-md"
                />
              </div>
              <div className="flex-grow">
                <div className="flex items-center">
                  <h3 className="font-medium">{jam.name}</h3>
                  <Crown className="ml-2 h-4 w-4 text-amber-500" />
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Avatar className="h-4 w-4 mr-1">
                    <AvatarImage src={jam.profile?.avatar_url || undefined} />
                    <AvatarFallback>{jam.profile?.username?.[0]?.toUpperCase() || 'J'}</AvatarFallback>
                  </Avatar>
                  <span>{jam.profile?.username || 'Utilisateur'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center mb-1">
                  <Star className="h-4 w-4 text-jam-honey fill-jam-honey mr-1" />
                  <span className="font-medium">{safeToFixed(jam.avg_rating)}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({jam.review_count || 0})
                  </span>
                </div>
                <div className="flex items-center text-sm font-medium">
                  {jam.price_euros} €
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild className="ml-2">
                <Link to={`/jam/${jam.id}`}>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {(!jams || jams.length === 0) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucune confiture professionnelle trouvée</p>
        </div>
      )}
    </div>
  );
};

export default ProJamsRanking;
