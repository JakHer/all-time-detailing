import { PageIntro } from "../components/PageIntro";
import { SectionCard } from "../components/SectionCard";

export function GalleryPage() {
  return (
    <>
      <PageIntro
        eyebrow="Galeria"
        title="Zdjęcia realizacji i dokumentacja jakości"
        description="Ten widok przygotujemy pod before/after, dokumentację stanu auta i materiały do publikacji w social mediach."
        metrics={[
          { label: "Sesje foto", value: "126" },
          { label: "Before/after", value: "78 kompletów" },
          { label: "Do publikacji", value: "12" },
          { label: "Powiązane auta", value: "96" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Dokumentacja pracy"
          description="Galeria może być jednocześnie narzędziem wewnętrznym i materiałem sprzedażowym."
          items={[
            "Zdjęcia przed rozpoczęciem i po zakończeniu usługi.",
            "Tagowanie po typie realizacji, aucie i kliencie.",
            "Archiwizacja uszkodzeń i elementów wymagających uwagi.",
          ]}
        />
        <SectionCard
          title="Treści marketingowe"
          description="Przy Supabase spokojnie podepniemy tu storage i porządny system albumów."
          items={[
            "Wyróżnianie najlepszych realizacji do portfolio.",
            "Przygotowanie galerii pod social media i stronę WWW.",
            "Szybki eksport wybranych materiałów dla klienta.",
          ]}
        />
      </section>
    </>
  );
}
