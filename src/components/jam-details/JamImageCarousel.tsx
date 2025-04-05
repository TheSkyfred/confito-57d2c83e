
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type JamImageCarouselProps = {
  primaryImage: string | null;
  secondaryImages: { id: string; url: string }[];
  jamName: string;
};

export const JamImageCarousel = ({ primaryImage, secondaryImages, jamName }: JamImageCarouselProps) => {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {primaryImage && (
          <CarouselItem key="primary">
            <div className="flex aspect-square items-center justify-center p-1">
              <img 
                src={primaryImage} 
                alt={jamName} 
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          </CarouselItem>
        )}
        
        {secondaryImages.map((image) => (
          <CarouselItem key={image.id}>
            <div className="flex aspect-square items-center justify-center p-1">
              <img 
                src={image.url} 
                alt={jamName} 
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
