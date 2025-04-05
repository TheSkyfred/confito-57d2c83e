
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileType } from '@/types/supabase';

type JamHeaderProps = {
  name: string;
  profile: ProfileType;
  favorited: boolean;
  toggleFavorite: () => void;
};

export const JamHeader = ({ name, profile, favorited, toggleFavorite }: JamHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="font-serif text-3xl font-bold">{name}</h1>
        <div className="flex items-center mt-2">
          <Link to={`/user/${profile.id}`} className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>{profile.username?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Par {profile.full_name || profile.username}
            </span>
          </Link>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleFavorite}
          className={favorited ? "text-jam-raspberry" : ""}
        >
          <Heart className="h-5 w-5" fill={favorited ? "currentColor" : "none"} />
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
