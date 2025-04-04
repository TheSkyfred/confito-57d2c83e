
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditBadge } from "@/components/ui/credit-badge"
import { AvatarBadge } from "@/components/ui/avatar-badge"
import { Heart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface JamCardProps {
  id: string
  name: string
  description: string
  imageUrl: string
  price: number
  rating?: number
  user: {
    name: string
    avatarUrl?: string
    badgeCount?: number
  }
  tags?: string[]
  isFavorite?: boolean
  onAddToCart?: () => void
  onToggleFavorite?: () => void
}

export default function JamCard({
  id,
  name,
  description,
  imageUrl,
  price,
  rating,
  user,
  tags,
  isFavorite = false,
  onAddToCart,
  onToggleFavorite,
}: JamCardProps) {
  return (
    <Card className="jam-card overflow-hidden h-full flex flex-col">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
        {rating && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-jam-honey text-jam-honey" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
        <button 
          className="absolute top-2 left-2 bg-white bg-opacity-80 rounded-full p-1.5"
          onClick={onToggleFavorite}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite ? 'fill-jam-raspberry text-jam-raspberry' : 'text-gray-500'}`}
          />
        </button>
      </div>
      <CardHeader className="p-3 pb-1">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-medium text-lg truncate">{name}</h3>
          <CreditBadge amount={price} size="sm" />
        </div>
        <div className="flex items-center mt-1 mb-2">
          <div className="relative mr-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            {user.badgeCount && user.badgeCount > 0 && (
              <AvatarBadge size="sm" content={user.badgeCount > 9 ? '9+' : user.badgeCount} />
            )}
          </div>
          <span className="text-xs text-muted-foreground">{user.name}</span>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-grow">
        <p className="text-sm line-clamp-2">{description}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-muted">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 mt-auto">
        <Button 
          onClick={onAddToCart} 
          className="w-full bg-jam-raspberry hover:bg-jam-raspberry/90 text-white"
        >
          Échanger
        </Button>
      </CardFooter>
    </Card>
  )
}
