import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, Upload, X, CheckCircle2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useUploadGalleryImage, type GalleryImage } from '../../lib/gallery';
import { useVehicles } from '../../lib/vehicles';
import { fetchBookings } from '../../lib/bookings';
import { ActionButton } from '../ui/ActionButton';
import { useQuery } from '@tanstack/react-query';

type GalleryUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialBookingId?: string | null;
  initialVehicleId?: string | null;
  initialType?: GalleryImage['type'];
};

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
  const [type, setType] = useState<NonNullable<GalleryImage['type']>>(
    initialType || 'Finished',
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: vehicles = [] } = useVehicles();
  const uploadMutation = useUploadGalleryImage();

  // Fetch bookings for the selected vehicle to allow grouping
  const { data: vehicleBookings = [] } = useQuery({
    queryKey: ['bookings', 'vehicle', vehicleId],
    queryFn: () => fetchBookings(), // In a real app, we'd filter by vehicle_id on the server
    enabled: !!vehicleId && !initialBookingId,
  });

  const filteredVehicleBookings = useMemo(() => {
    // This is a client-side filter for now since fetchBookings doesn't take vehicleId
    // In a production app, we should add vehicleId filter to fetchBookings
    return vehicleBookings.filter(b => (b as any).vehicleId === vehicleId);
  }, [vehicleBookings, vehicleId]);

  // Sync state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setVehicleId(initialVehicleId || '');
      setBookingId(initialBookingId || '');
      if (initialType) {
        setType(initialType);
      } else if (!initialBookingId) {
        setType('Finished');
      }
      setShowAdvanced(false);
      setFile(null);
    }
  }, [isOpen, initialVehicleId, initialType, initialBookingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync({
        file,
        metadata: {
          booking_id: bookingId || null,
          vehicle_id: vehicleId || initialVehicleId || null,
          type,
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

  const previewUrl = file ? URL.createObjectURL(file) : null;
  const selectedVehicle = vehicles.find(
    (v) => v.id === (vehicleId || initialVehicleId),
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4 outline-none transition-all duration-300 animate-in zoom-in-95">
          <div className="rounded-4xl border border-white/10 bg-[#121314] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Dialog.Title className="text-xl font-semibold text-white">
                  {initialBookingId
                    ? 'Dokumentacja wizyty'
                    : 'Wgraj do realizacji'}
                </Dialog.Title>
                {selectedVehicle && (
                  <p className="mt-1 text-xs text-stone-400">
                    Pojazd:{' '}
                    <span className="text-amber-200/80">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                  </p>
                )}
              </div>
              <Dialog.Close className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
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

              {!initialBookingId && (
                <div className="space-y-4">
                  {!initialVehicleId && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-400">
                        Pojazd
                      </label>
                      <select
                        value={vehicleId}
                        onChange={(e) => {
                          setVehicleId(e.target.value);
                          setBookingId(''); // Reset booking when vehicle changes
                        }}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-amber-400/30"
                      >
                        <option value="">Wybierz pojazd</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.make} {v.model} ({v.registration})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {vehicleId && filteredVehicleBookings.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="mb-2 block text-sm font-medium text-stone-400">
                        Przypisz do konkretnej wizyty
                      </label>
                      <div className="grid gap-2">
                        {filteredVehicleBookings.slice(0, 3).map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBookingId(b.id)}
                            className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                              bookingId === b.id
                                ? 'border-amber-400/50 bg-amber-400/10'
                                : 'border-white/5 bg-white/5 hover:bg-white/8'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-white">
                                {b.service}
                              </p>
                              <p className="mt-0.5 text-[10px] text-stone-500">
                                {b.date} • {b.status}
                              </p>
                            </div>
                            {bookingId === b.id && (
                              <CheckCircle2 className="h-4 w-4 text-amber-400" />
                            )}
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
                          Ogólna realizacja (brak wizyty)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-400">
                    Rodzaj zdjęcia
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'Before', label: 'Przed' },
                      { id: 'WIP', label: 'W trakcie' },
                      { id: 'After', label: 'Po' },
                      { id: 'Finished', label: 'Portfolio' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id as any)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                          type === t.id
                            ? 'bg-amber-400 text-black'
                            : 'bg-white/5 text-stone-400 hover:bg-white/10'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </label>
              </div>

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
                  disabled={!file || isUploading || (!vehicleId && !initialVehicleId)}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Przesyłanie...
                    </>
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
