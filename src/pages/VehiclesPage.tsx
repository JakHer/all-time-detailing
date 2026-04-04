import { PageIntro } from '../components/PageIntro';
import { SectionCard } from '../components/SectionCard';

export function VehiclesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Pojazdy"
        title="Kartoteka aut z pełną historią realizacji"
        description="Widok pojazdów przygotujemy pod dane techniczne, historię zabiegów, zdjęcia i notatki o stanie auta."
        metrics={[
          { label: 'Pojazdy', value: '247' },
          { label: 'SUV', value: '39%' },
          { label: 'Premium', value: '54' },
          { label: 'Nowe w miesiącu', value: '18' },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Zakres danych"
          description="Każdy samochód może mieć własną historię niezależnie od zmian właściciela lub zakresu usług."
          items={[
            'Marka, model, rocznik, VIN i numer rejestracyjny.',
            'Historia detailingu, korekt, powłok i myć serwisowych.',
            'Uwagi o lakierze, wnętrzu i uszkodzeniach przed pracą.',
          ]}
        />
        <SectionCard
          title="Obsługa premium"
          description="To pozwoli zespołowi szybciej wejść w kontekst konkretnego auta."
          items={[
            'Galeria before/after powiązana z konkretnym pojazdem.',
            'Sugerowane kolejne usługi i terminy odświeżenia ochrony.',
            'Historia produktów i powłok użytych przy realizacji.',
          ]}
        />
      </section>
    </>
  );
}
