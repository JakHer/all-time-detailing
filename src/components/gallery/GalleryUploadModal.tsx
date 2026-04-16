import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Loader2,
  Upload,
  X,
  ImagePlus,
  Info,
  Layout,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { fetchBookings, type Booking } from '../../lib/bookings';
import { useUploadGalleryImage, type GalleryImage } from '../../lib/gallery';
import { useVehicles } from '../../lib/vehicles';
import { Select } from '../ui/Select';
import { inputClassName } from '../ui/FormElements';

type GalleryUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialBookingId?: string | null;
  initialVehicleId?: string | null;
  initialType?: GalleryImage['type'];
};

type UploadMode = 'documentation' | 'portfolio';

const documentationTypeOptions: Array<{
  id: NonNullable<GalleryImage['type']>;
  label: string;
}> = [
  { id: 'Before', label: 'Przed' },
  { id: 'WIP', label: 'W trakcie' },
  { id: 'After', label: 'Po' },
];

function resolveUploadMode(
  initialBookingId?: string | null,
  initialType?: GalleryImage['type'],
): UploadMode {
  return initialBookingId || (initialType && initialType !== 'Finished')
    ? 'documentation'
    : 'portfolio';
}

export function GalleryUploadModal({
  isOpen,
  onClose,
  initialBookingId,
  initialVehicleId,
  initialType,
}: GalleryUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [vehicleId, setVehicleId] = useState(initialVehicleId || '');
  const [bookingId, setBookingId] = useState(initialBookingId || '');
  const [mode, setMode] = useState<UploadMode>(
    resolveUploadMode(initialBookingId, initialType),
  );
  const [type, setType] = useState<NonNullable<GalleryImage['type']>>(
    initialType || 'Finished',
  );
  const [isUploading, setIsUploading] = useState(false);

  const { data: vehicles = [] } = useVehicles();
  const uploadMutation = useUploadGalleryImage();

  const selectedVehicle = useMemo(
    () =>
      vehicles.find((v) => v.id === (vehicleId || initialVehicleId)) ?? null,
    [initialVehicleId, vehicleId, vehicles],
  );

  const { data: vehicleBookings = [] } = useQuery({
    queryKey: ['bookings', 'vehicle', vehicleId],
    queryFn: () => fetchBookings(),
    enabled: !!selectedVehicle && !initialBookingId,
  });

  const filteredVehicleBookings = useMemo(() => {
    if (!selectedVehicle) return [] as Booking[];
    return vehicleBookings.filter(
      (b) => b.licensePlate === selectedVehicle.registration,
    );
  }, [selectedVehicle, vehicleBookings]);

  const resolvedVehicleId = vehicleId || initialVehicleId || '';
  const isDocumentationMode = mode === 'documentation';

  useEffect(() => {
    if (!isOpen) return;
    setVehicleId(initialVehicleId || '');
    setBookingId(initialBookingId || '');
    setMode(resolveUploadMode(initialBookingId, initialType));
    setType(initialType || (initialBookingId ? 'Before' : 'Finished'));
    setFile(null);
  }, [initialBookingId, initialType, initialVehicleId, isOpen]);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync({
        file,
        metadata: {
          booking_id: isDocumentationMode && bookingId ? bookingId : null,
          vehicle_id: resolvedVehicleId || null,
          type: isDocumentationMode ? type : 'Finished',
        },
      });
      toast.success('Zdjęcie zostało przesłane');
      onClose();
    } catch {
      toast.error('Błąd podczas przesyłania zdjęcia');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[96vh] w-[calc(100%-1rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-4xl border border-white/10 bg-[#0d0e10] shadow-[0_40px_120px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-300 md:max-h-[92vh] md:w-[calc(100%-2rem)] md:rounded-[40px]">
          <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/2 px-6 py-5 md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                <ImagePlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Prześlij zdjęcie
                </h2>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-widest mt-0.5">
                  Dokumentacja i Portfolio
                </p>
              </div>
            </div>
            <Dialog.Close className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-stone-400 transition hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8 space-y-8">
              <div
                className={`group relative flex h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all ${
                  file
                    ? 'border-amber-400/50 bg-amber-400/5'
                    : 'border-white/10 bg-white/2 hover:border-amber-400/30 hover:bg-amber-400/5'
                }`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {previewUrl ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                    <img
                      src={previewUrl}
                      alt="Podgląd"
                      className="h-32 w-48 rounded-2xl border border-white/10 object-cover shadow-2xl"
                    />
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-amber-200">
                      {file?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-stone-400 transition-all duration-300 group-hover:scale-110 group-hover:text-amber-400">
                      <Upload className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-stone-300">
                      Kliknij, aby wybrać zdjęcie
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      JPG, PNG lub WEBP do 10MB
                    </p>
                  </>
                )}
              </div>

              {!initialBookingId && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Layout className="h-4 w-4 text-amber-400" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                      Miejsce docelowe
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('documentation');
                        setType('Before');
                      }}
                      className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'documentation' ? 'bg-amber-400 text-black shadow-lg' : 'bg-white/5 text-stone-400 hover:bg-white/10'}`}
                    >
                      Do realizacji
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('portfolio');
                        setBookingId('');
                        setType('Finished');
                      }}
                      className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'portfolio' ? 'bg-amber-400 text-black shadow-lg' : 'bg-white/5 text-stone-400 hover:bg-white/10'}`}
                    >
                      Do portfolio
                    </button>
                  </div>
                </section>
              )}

              <section className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <Info className="h-4 w-4 text-amber-400" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                    Informacje o zdjęciu
                  </h3>
                </div>

                <div className="space-y-4">
                  {!initialVehicleId && (
                    <div className="animate-in fade-in duration-300">
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-stone-600 ml-1">
                        Pojazd
                      </label>
                      <Select
                        value={vehicleId}
                        onChange={(e) => {
                          setVehicleId(e.target.value);
                          setBookingId('');
                        }}
                        className={inputClassName}
                      >
                        <option value="">Wybierz pojazd...</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.make} {v.model} ({v.registration})
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {isDocumentationMode && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-stone-600 ml-1">
                          Rodzaj zdjęcia
                          <div className="mt-2 flex gap-2">
                            {documentationTypeOptions.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setType(opt.id)}
                                className={`flex-1 rounded-xl border py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${type === opt.id ? 'border-amber-400/30 bg-amber-400/20 text-amber-400' : 'border-transparent bg-white/5 text-stone-500 hover:bg-white/10'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </label>
                      </div>

                      {resolvedVehicleId &&
                        filteredVehicleBookings.length > 0 && (
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-stone-600 ml-1">
                              Przypisz do wizyty
                            </label>
                            <div className="grid gap-2">
                              {filteredVehicleBookings.slice(0, 3).map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setBookingId(b.id)}
                                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${bookingId === b.id ? 'border-amber-400/50 bg-amber-400/10' : 'border-white/5 bg-white/2 hover:bg-white/5'}`}
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-white">
                                      {b.service}
                                    </p>
                                    <p className="mt-1 text-[10px] font-medium uppercase text-stone-500">
                                      {b.date} • {b.status}
                                    </p>
                                  </div>
                                  {bookingId === b.id && (
                                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-white/5 bg-white/2 px-6 py-5 md:px-8">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={!file || isUploading || !resolvedVehicleId}
                className="rounded-2xl bg-amber-400 px-8 py-3 text-sm font-bold text-black shadow-[0_10px_20px_rgba(251,191,36,0.2)] transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === 'portfolio' ? (
                  'Zapisywanie'
                ) : (
                  'Zapisz w realizacji'
                )}
              </button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
