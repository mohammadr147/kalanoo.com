
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { fetchBannersClient } from '@/app/actions/client/fetch-banners-client'; // Action to fetch banners client-side
import type { Banner } from '@/types';
import { Loader2 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';


export function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBanners() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchBannersClient();
        if (result.success && result.banners) {
          // Filter for active banners and sort by order
          setBanners(result.banners.filter(b => b.is_active).sort((a, b) => a.order - b.order));
        } else {
          setError(result.error || 'Failed to load banners.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        console.error("Error fetching banners for slider:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 md:h-96 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        در حال بارگذاری بنرها...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 md:h-96 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center p-4">
        خطا در بارگذاری بنرها: {error}
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
        هیچ بنری برای نمایش وجود ندارد.
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
      dir="rtl" // Ensure RTL direction for carousel
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <Card className="overflow-hidden shadow-md">
              <CardContent className="flex items-center justify-center p-0">
                 <AspectRatio ratio={16 / 6} className="bg-muted"> {/* Adjust ratio as needed */}
                  {banner.link ? (
                    <Link href={banner.link} legacyBehavior>
                      <a target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        <Image
                          src={banner.image_url}
                          alt={banner.title || 'Banner image'}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                          priority={banners.indexOf(banner) === 0} // Prioritize first image
                          data-ai-hint={`banner ${banner.title || ''}`.trim()}
                        />
                      </a>
                    </Link>
                  ) : (
                    <Image
                      src={banner.image_url}
                      alt={banner.title || 'Banner image'}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                      priority={banners.indexOf(banner) === 0}
                      data-ai-hint={`banner ${banner.title || ''}`.trim()}
                    />
                  )}
                 </AspectRatio>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="right-4 left-auto hidden sm:flex" /> {/* Adjusted for RTL */}
      <CarouselNext className="left-4 right-auto hidden sm:flex" /> {/* Adjusted for RTL */}
    </Carousel>
  );
}
