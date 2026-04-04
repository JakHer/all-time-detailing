import { PageIntro } from '../components/PageIntro';
import { SectionCard } from '../components/SectionCard';

export function BookingsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Rezerwacje"
        title="Kalendarz, który porządkuje dzień studia"
        description="Tutaj zbudujemy widok planowania wizyt, przypisywania usług, statusów i obłożenia stanowisk."
        metrics={[
          { label: 'Dzisiaj', value: '8 wizyt' },
          { label: 'Potwierdzone', value: '6' },
          { label: 'Do kontaktu', value: '2' },
          { label: 'Stanowiska', value: '3/4 zajęte' },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Najbliższe funkcje"
          description="Pierwsza wersja modułu rezerwacji może objąć najważniejsze scenariusze recepcji."
          items={[
            'Widok dnia i tygodnia dla zespołu i recepcji.',
            'Szybkie tworzenie rezerwacji z wyborem klienta, auta i pakietu.',
            'Statusy: nowe, potwierdzone, w realizacji, zakończone.',
          ]}
        />
        <SectionCard
          title="Co potem"
          description="Gdy podłączymy backend, ten widok stanie się centralnym miejscem pracy studia."
          items={[
            'Powiadomienia i przypomnienia dla klientów.',
            'Blokowanie slotów i zarządzanie obłożeniem stanowisk.',
            'Powiązanie z historią usług i zdjęciami realizacji.',
          ]}
        />
      </section>
    </>
  );
}
