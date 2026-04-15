import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { PageIntro } from '../components/PageIntro';
import { GalleryGrid } from '../components/gallery/GalleryGrid';
import { GalleryUploadModal } from '../components/gallery/GalleryUploadModal';
import { ActionButton } from '../components/ui/ActionButton';
import { SearchField } from '../components/ui/SearchField';
import { ToolbarPanel } from '../components/ui/ToolbarPanel';
import { useGalleryImages } from '../lib/gallery';

export function GalleryPage() {
  const [query, setQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { data: images = [] } = useGalleryImages();

  const featuredCount = images.filter((img) => img.is_featured).length;
  const beforeCount = images.filter((img) => img.type === 'Before').length;
  const afterCount = images.filter((img) => img.type === 'After').length;

  const metrics = [
    { label: 'Wszystkie zdjęcia', value: String(images.length) },
    { label: 'Wyróżnione', value: String(featuredCount) },
    { label: 'Przed / Po', value: `${beforeCount} / ${afterCount}` },
    {
      label: 'Realizacje',
      value: String(
        new Set(images.map((img) => img.vehicle_id).filter(Boolean)).size,
      ),
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
      <PageIntro
        eyebrow="Galeria"
        title="Zdjęcia realizacji i dokumentacja jakości"
        description="Zarządzaj wizualnym portfolio studia, dokumentuj stan aut przed i po usługach oraz buduj zaufanie klientów."
        metrics={metrics}
      />

      <ToolbarPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Szukaj po marce, modelu, kliencie lub rejestracji..."
            className="sm:max-w-md"
          />
          <ActionButton
            icon={ImagePlus}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Dodaj zdjęcia
          </ActionButton>
        </div>
      </ToolbarPanel>

      <section className="min-h-180">
        <GalleryGrid query={query} />
      </section>

      <GalleryUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
