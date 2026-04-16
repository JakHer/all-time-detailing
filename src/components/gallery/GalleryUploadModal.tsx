import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { fetchBookings, type Booking } from '../../lib/bookings';
import { useUploadGalleryImage, type GalleryImage } from '../../lib/gallery';
import { useVehicles } from '../../lib/vehicles';
import { ActionButton } from '../ui/ActionButton';
import { Select } from '../ui/Select';

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
  if (initialBookingId) {
    return 'documentation';
  }

  if (initialType && initialType !== 'Finished') {
    return 'documentation';
  }

  return 'portfolio';
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
      vehicles.find(
        (vehicle) => vehicle.id === (vehicleId || initialVehicleId),
      ) ?? null,
    [initialVehicleId, vehicleId, vehicles],
  );

  const { data: vehicleBookings = [] } = useQuery({
    queryKey: ['bookings', 'vehicle', vehicleId],
    queryFn: () => fetchBookings(),
    enabled: !!selectedVehicle && !initialBookingId,
  });

  const filteredVehicleBookings = useMemo(() => {
    if (!selectedVehicle) {
      return [] as Booking[];
    }

    return vehicleBookings.filter(
      (booking) => booking.licensePlate === selectedVehicle.registration,
    );
  }, [selectedVehicle, vehicleBookings]);

  const resolvedVehicleId = vehicleId || initialVehicleId || '';
  const isDocumentationMode = mode === 'documentation';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setVehicleId(initialVehicleId || '');
    setBookingId(initialBookingId || '');
    setMode(resolveUploadMode(initialBookingId, initialType));

    if (initialType) {
      setType(initialType);
    } else if (!initialBookingId) {
      setType('Finished');
    }

    setFile(null);
  }, [initialBookingId, initialType, initialVehicleId, isOpen]);

  const previewUrl = useMemo(() => {
    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
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
        <Dialog.Overlay className="fixed inset-0 z-50 animate-in fade-in bg-black/80 backdrop-blur-sm transition-all duration-300" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 p-4 outline-none transition-all duration-300">
          <div className="rounded-4xl border border-white/10 bg-[#121314] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Dialog.Title className="text-xl font-semibold text-white">
                  {initialBookingId
                    ? 'Dokumentacja wizyty'
                    : mode === 'portfolio'
                      ? 'Dodaj do portfolio'
                      : 'Dodaj do realizacji'}
                </Dialog.Title>
                {selectedVehicle ? (
                  <p className="mt-1 text-xs text-stone-400">
                    Pojazd:{' '}
                    <span className="text-amber-200/80">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                  </p>
                ) : null}
              </div>
              <Dialog.Close className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!initialBookingId ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-400">
                      Gdzie ma trafić zdjęcie?
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('documentation');
                          setType((currentType) =>
                            currentType === 'Finished' ? 'Before' : currentType,
                          );
                        }}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                          mode === 'documentation'
                            ? 'bg-amber-400 text-black'
                            : 'bg-white/5 text-stone-400 hover:bg-white/10'
                        }`}
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
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                          mode === 'portfolio'
                            ? 'bg-amber-400 text-black'
                            : 'bg-white/5 text-stone-400 hover:bg-white/10'
                        }`}
                      >
                        Do portfolio
                      </button>
                    </div>
                  </label>
                </div>
              ) : null}

              <div
                className={`relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all ${
                  file
                    ? 'border-amber-400/50 bg-amber-400/5'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
                {previewUrl ? (
                  <div className="flex flex-col items-center p-4">
                    <img
                      src={previewUrl}
                      alt="Podgląd"
                      className="mb-2 h-24 w-24 rounded-xl object-cover"
                    />
                    <p className="max-w-[200px] truncate text-sm font-medium text-amber-200">
                      {file?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-stone-400">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-stone-300">
                      Kliknij, aby wybrać zdjęcie
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      JPG, PNG lub WEBP do 10MB
                    </p>
                  </>
                )}
              </div>

              {!initialBookingId || isDocumentationMode ? (
                <div className="space-y-4">
                  {!initialVehicleId ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-400">
                        Pojazd
                      </label>
                      <Select
                        value={vehicleId}
                        onChange={(event) => {
                          setVehicleId(event.target.value);
                          setBookingId('');
                        }}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-amber-400/30"
                      >
                        <option value="">Wybierz pojazd</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} (
                            {vehicle.registration})
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : null}

                  {isDocumentationMode &&
                  resolvedVehicleId &&
                  filteredVehicleBookings.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="mb-2 block text-sm font-medium text-stone-400">
                        Przypisz do konkretnej wizyty
                      </label>
                      <div className="grid gap-2">
                        {filteredVehicleBookings.slice(0, 3).map((booking) => (
                          <button
                            key={booking.id}
                            type="button"
                            onClick={() => setBookingId(booking.id)}
                            className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                              bookingId === booking.id
                                ? 'border-amber-400/50 bg-amber-400/10'
                                : 'border-white/5 bg-white/5 hover:bg-white/8'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-white">
                                {booking.service}
                              </p>
                              <p className="mt-0.5 text-[10px] text-stone-500">
                                {booking.date} • {booking.status}
                              </p>
                            </div>
                            {bookingId === booking.id ? (
                              <CheckCircle2 className="h-4 w-4 text-amber-400" />
                            ) : null}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setBookingId('')}
                          className={`rounded-xl border p-3 text-left text-[10px] font-bold uppercase tracking-wider transition-all ${
                            bookingId === ''
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-white/5 bg-transparent text-stone-500'
                          }`}
                        >
                          Ogólna realizacja bez przypisanej wizyty
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isDocumentationMode ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-400">
                      Rodzaj zdjęcia
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {documentationTypeOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setType(option.id)}
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                            type === option.id
                              ? 'bg-amber-400 text-black'
                              : 'bg-white/5 text-stone-400 hover:bg-white/10'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
              ) : null}

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  onClick={onClose}
                >
                  Anuluj
                </button>
                <ActionButton
                  type="submit"
                  disabled={!file || isUploading || !resolvedVehicleId}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Przesyłanie...
                    </>
                  ) : mode === 'portfolio' ? (
                    'Zapisz w portfolio'
                  ) : (
                    'Zapisz w realizacji'
                  )}
                </ActionButton>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
