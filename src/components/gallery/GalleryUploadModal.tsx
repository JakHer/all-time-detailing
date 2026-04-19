import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Loader2,
  Upload,
  ImagePlus,
  Info,
  Layout,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { fetchBookings, type Booking } from '../../lib/bookings';
import { useUploadGalleryImage, type GalleryImage } from '../../lib/gallery';
import { useVehicleOptions } from '../../lib/vehicles';
import { Select } from '../ui/Select';
import { inputClassName } from '../ui/FormElements';
import { FormModal } from '../ui/FormModal';

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

  const { data: vehicles = [] } = useVehicleOptions();
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
      (booking) => booking.licensePlate === selectedVehicle.registration,
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
    <FormModal
      open={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      icon={ImagePlus}
      title="Prześlij zdjęcie"
      eyebrow="Dokumentacja i portfolio"
      size="sm"
      bodyClassName="space-y-8"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 md:w-auto"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={!file || isUploading || !resolvedVehicleId}
            className="flex w-full items-center justify-center rounded-2xl bg-amber-400 px-8 py-3 text-sm font-bold text-black shadow-[0_10px_20px_rgba(251,191,36,0.2)] transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-50 disabled:hover:translate-y-0 md:w-auto"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'portfolio' ? (
              'Zapisywanie'
            ) : (
              'Zapisz w realizacji'
            )}
          </button>
        </>
      }
    >
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
          onChange={(event) => setFile(event.target.files?.[0] || null)}
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

      {!initialBookingId ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Layout className="h-4 w-4 text-amber-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
              Miejsce docelowe
            </h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setMode('documentation');
                setType('Before');
              }}
              className={`rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                mode === 'documentation'
                  ? 'bg-amber-400 text-black shadow-lg'
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
              className={`rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                mode === 'portfolio'
                  ? 'bg-amber-400 text-black shadow-lg'
                  : 'bg-white/5 text-stone-400 hover:bg-white/10'
              }`}
            >
              Do portfolio
            </button>
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-amber-400" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
            Informacje o zdjęciu
          </h3>
        </div>

        <div className="space-y-4">
          {!initialVehicleId ? (
            <div className="animate-in fade-in duration-300">
              <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-widest text-stone-600">
                Pojazd
              </label>
              <Select
                value={vehicleId}
                onChange={(event) => {
                  setVehicleId(event.target.value);
                  setBookingId('');
                }}
                className={inputClassName}
              >
                <option value="">Wybierz pojazd...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.registration})
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          {isDocumentationMode ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-widest text-stone-600">
                  Rodzaj zdjęcia
                </label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {documentationTypeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setType(option.id)}
                      className={`rounded-xl border py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        type === option.id
                          ? 'border-amber-400/30 bg-amber-400/20 text-amber-400'
                          : 'border-transparent bg-white/5 text-stone-500 hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {resolvedVehicleId && filteredVehicleBookings.length > 0 ? (
                <div>
                  <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-widest text-stone-600">
                    Przypisz do wizyty
                  </label>
                  <div className="grid gap-2">
                    {filteredVehicleBookings.slice(0, 3).map((booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => setBookingId(booking.id)}
                        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                          bookingId === booking.id
                            ? 'border-amber-400/50 bg-amber-400/10'
                            : 'border-white/5 bg-white/2 hover:bg-white/5'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-white">
                            {booking.service}
                          </p>
                          <p className="mt-1 text-[10px] font-medium uppercase text-stone-500">
                            {booking.date} | {booking.status}
                          </p>
                        </div>
                        {bookingId === booking.id ? (
                          <CheckCircle2 className="h-4 w-4 text-amber-400" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </FormModal>
  );
}
