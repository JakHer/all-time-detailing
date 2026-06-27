import type { GalleryImageWithRelations } from '../../lib/gallery';

export type Realization = {
  id: string;
  title: string;
  date: string;
  images: GalleryImageWithRelations[];
  isIndependent: boolean;
};

export type VehicleGallery = {
  id: string;
  make: string;
  model: string;
  registration: string;
  clientName: string;
  realizations: Realization[];
  totalPhotos: number;
  featuredImageUrl?: string;
};
