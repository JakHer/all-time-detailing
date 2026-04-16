import { PageIntro } from '../components/PageIntro';
import { SectionCard } from '../components/SectionCard';
import { MobilePageHeader } from '../components/ui/MobilePageHeader';

export function SettingsPage() {
  return (
    <>
      <div className="hidden sm:block">
        <PageIntro
          eyebrow="Ustawienia"
          title="Konfiguracja studia, zespolu i automatyzacji"
          description="Tutaj zbierzemy ustawienia firmy, uzytkownikow, szablonow uslug, integracji i przyszlych automatyzacji."
          metrics={[
            { label: 'Uzytkownicy', value: '5' },
            { label: 'Role', value: '3' },
            { label: 'Integracje', value: '0' },
            { label: 'Powiadomienia', value: 'W planie' },
          ]}
        />
      </div>

      <MobilePageHeader eyebrow="Ustawienia" title="Konfiguracja" />

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Ustawienia organizacji"
          description="Na poczatek ten obszar moze objac najwazniejsza konfiguracje operacyjna."
          items={[
            'Dane studia, godziny pracy i lokalizacje.',
            'Role uzytkownikow i poziomy dostepu.',
            'Domyslne statusy zlecen i schematy pracy.',
          ]}
        />
        <SectionCard
          title="Integracje i workflow"
          description="To bedzie naturalne miejsce pod integracje oraz procesy automatyczne."
          items={[
            'Podpiecie Supabase i zasad dostepu.',
            'Szablony wiadomosci i przypomnien dla klientow.',
            'Automatyczne akcje po zakonczeniu uslugi.',
          ]}
        />
      </section>
    </>
  );
}
