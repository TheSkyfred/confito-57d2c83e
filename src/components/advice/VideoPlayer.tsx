
import React from 'react';
import { Video } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string | null | undefined;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title = "Vidéo" }) => {
  // Si l'URL est vide, null ou undefined, afficher un message
  if (!videoUrl) {
    return (
      <div className="bg-muted rounded-lg p-4 text-center">
        <Video className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
        <p>Aucune vidéo disponible</p>
      </div>
    );
  }

  // Extraire l'ID de la vidéo YouTube de l'URL
  const getYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className="bg-muted rounded-lg p-4 text-center">
        <Video className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
        <p>Format de vidéo non supporté</p>
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline mt-2 inline-block"
        >
          Voir la vidéo sur le site externe
        </a>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden shadow-md">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
