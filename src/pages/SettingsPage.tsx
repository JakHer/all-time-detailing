import { PageIntro } from "../components/PageIntro";
import { SectionCard } from "../components/SectionCard";

export function SettingsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Ustawienia"
        title="Konfiguracja studia, zespołu i automatyzacji"
        description="Tutaj zbierzemy ustawienia firmy, użytkowników, szablonów usług, integracji i przyszłych automatyzacji."
        metrics={[
          { label: "Użytkownicy", value: "5" },
          { label: "Role", value: "3" },
          { label: "Integracje", value: "0" },
          { label: "Powiadomienia", value: "W planie" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Ustawienia organizacji"
          description="Na początek ten obszar może objąć najważniejszą konfigurację operacyjną."
          items={[
            "Dane studia, godziny pracy i lokalizacje.",
            "Role użytkowników i poziomy dostępu.",
            "Domyślne statusy zleceń i schematy pracy.",
          ]}
        />
        <SectionCard
          title="Integracje i workflow"
          description="To będzie naturalne miejsce pod integracje oraz procesy automatyczne."
          items={[
            "Podpięcie Supabase i zasad dostępu.",
            "Szablony wiadomości i przypomnień dla klientów.",
            "Automatyczne akcje po zakończeniu usługi.",
          ]}
        />
      </section>
    </>
  );
}
