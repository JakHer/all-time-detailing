import { PageIntro } from "../components/PageIntro";
import { SectionCard } from "../components/SectionCard";

export function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Usługi"
        title="Pakiety, cennik i standardy realizacji"
        description="Tutaj zbudujemy ofertę usług, pakietów i dodatków, tak żeby recepcja mogła szybko składać spójne wyceny."
        metrics={[
          { label: "Pakiety główne", value: "6" },
          { label: "Dodatki", value: "14" },
          { label: "Najczęstszy wybór", value: "Premium interior" },
          { label: "Top marża", value: "Ceramika" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Katalog usług"
          description="Ten moduł pozwoli poukładać ofertę i uprości pracę recepcji podczas tworzenia wizyt."
          items={[
            "Pakiety bazowe i premium z czasem realizacji.",
            "Usługi dodatkowe i dopłaty zależne od klasy pojazdu.",
            "Opis zakresu prac widoczny dla zespołu i klienta.",
          ]}
        />
        <SectionCard
          title="Cennik i standardy"
          description="To będzie też dobre miejsce na porządek w procedurach realizacji."
          items={[
            "Warianty cenowe dla segmentów aut.",
            "Checklisty wykonania i standardy jakości.",
            "Gotowość pod przyszłe wyceny i oferty PDF.",
          ]}
        />
      </section>
    </>
  );
}
