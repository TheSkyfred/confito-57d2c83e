
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal } from 'lucide-react';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  jam_count: number;
  review_count: number;
  sale_count: number;
  avg_rating: number;
}

interface TopUsersRankingProps {
  users: User[] | undefined;
  isLoading: boolean;
}

const getUserRankBadge = (index: number) => {
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

const TopUsersRanking: React.FC<TopUsersRankingProps> = ({ users, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {users?.map((user: User, index: number) => (
        <Card key={user.id} className={index < 3 ? "border-jam-honey" : ""}>
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="flex items-center justify-center w-10 mr-4">
                {getUserRankBadge(index)}
              </div>
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>{(user.username?.[0] || 'U').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <h3 className="font-medium">{user.full_name || user.username}</h3>
                <div className="text-sm text-muted-foreground">
                  @{user.username}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="font-medium">{user.jam_count}</div>
                  <div className="text-xs text-muted-foreground">Confitures</div>
                </div>
                <div>
                  <div className="flex items-center justify-center">
                    <ShoppingCart className="h-3 w-3 text-slate-500 mr-1" />
                    <span className="font-medium">{user.sale_count}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Vendues</div>
                </div>
                <div>
                  <div className="flex items-center justify-center">
                    <Star className="h-3 w-3 text-jam-honey fill-jam-honey mr-1" />
                    <span className="font-medium">{safeToFixed(user.avg_rating)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Note moy.</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild className="ml-2">
                <Link to={`/profile/${user.id}`}>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {(!users || users.length === 0) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun confiturier trouvé</p>
        </div>
      )}
    </div>
  );
};

export default TopUsersRanking;
