
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileType } from '@/types/supabase';

type JamHeaderProps = {
  name: string;
  profile: ProfileType;
};

export const JamHeader = ({ name, profile }: JamHeaderProps) => {
  // Ensure we have profile data and it has an id
  if (!profile || !profile.id) {
    console.error("Missing profile data in JamHeader");
  }

  // Safely access profile properties
  const username = profile?.username || 'Utilisateur';
  const fullName = profile?.full_name || username;
  const avatarUrl = profile?.avatar_url || '';
  const profileId = profile?.id || '';
  const initial = username[0]?.toUpperCase() || '?';

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold">{name}</h1>
      <div className="flex items-center mt-2">
        <Link to={`/user/${profileId}`} className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Par {fullName}
          </span>
        </Link>
      </div>
    </div>
  );
};
