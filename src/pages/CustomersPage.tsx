import { PageIntro } from '../components/PageIntro';
import { SectionCard } from '../components/SectionCard';

export function CustomersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Klienci"
        title="Baza klientów z historią wizyt i wartością relacji"
        description="Ten moduł przygotujemy pod pełną kartotekę klienta, historię kontaktu, ulubione usługi i notatki zespołu."
        metrics={[
          { label: 'Aktywni klienci', value: '184' },
          { label: 'VIP', value: '21' },
          { label: 'Powracający', value: '68%' },
          { label: 'Śr. wartość', value: '2 940 zł' },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Profil klienta"
          description="Każdy klient dostanie własny czytelny profil, który pomaga działać szybciej i bardziej premium."
          items={[
            'Dane kontaktowe i historia wszystkich wizyt.',
            'Preferencje, zgody marketingowe i notatki obsługi.',
            'Łączenie jednego klienta z wieloma pojazdami.',
          ]}
        />
        <SectionCard
          title="Relacje i sprzedaż"
          description="To miejsce będzie też wspierało retencję i obsługę klientów premium."
          items={[
            'Oznaczanie klientów VIP i flotowych.',
            'Podpowiedzi kolejnych usług na podstawie historii.',
            'Segmentacja pod kampanie i przypomnienia serwisowe.',
          ]}
        />
      </section>
    </>
  );
}
