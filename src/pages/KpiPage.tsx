import { useState } from 'react';
import { KpiMemberDetails } from '../components/kpi/KpiMemberDetails';
import { KpiOverviewStrip } from '../components/kpi/KpiOverviewStrip';
import { KpiProcessSection } from '../components/kpi/KpiProcessSection';
import { KpiSection } from '../components/kpi/KpiSection';
import { KpiTeamList } from '../components/kpi/KpiTeamList';
import { PageIntro } from '../components/common/PageIntro';
import { MasterDetailLayout } from '../components/layout/MasterDetailLayout';
import { MobileDetailSheet } from '../components/layout/MobileDetailSheet';
import { MobilePageHeader } from '../components/common/MobilePageHeader';
import { teamMembers } from '../data/kpi';

export const KpiPage = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const selectedMember =
    teamMembers.find((member) => member.id === selectedMemberId) ?? null;

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(min-width: 1536px)').matches
    ) {
      setIsMobileDetailsOpen(true);
    }
  };

  const closeMemberDetails = () => {
    setSelectedMemberId(null);
    setIsMobileDetailsOpen(false);
  };

  return (
    <>
      <div className="hidden sm:block">
        <PageIntro
          eyebrow="System KPI"
          title="Mierzymy to, co ma wplyw na jakosc, termin i zysk."
          description="Pierwszy krok modulu KPI: wspolny proces pracy, ktory pozniej polaczymy z punktacja zespolu i celami miesiecznymi."
          metrics={[
            { label: 'Etapy procesu', value: '6' },
            { label: 'Maksymalny wynik', value: '100 pkt' },
            { label: 'Przeglad', value: 'Miesieczny' },
            { label: 'Cel', value: '+1% dziennie' },
          ]}
        />
      </div>

      <MobilePageHeader
        eyebrow="KPI"
        title="Proces zespolu"
        chips={['6 etapow', '100 pkt', 'przeglad miesieczny']}
      />

      <KpiSection
        eyebrow="1. Procesy"
        title="Jak to dziala?"
        description="Ten sam rytm pracy dla kazdego projektu: od planowania po miesieczne wnioski. Dzieki temu KPI nie jest ocena z kosmosu, tylko wynikiem codziennego procesu."
      >
        <KpiProcessSection />
      </KpiSection>

      <KpiSection
        eyebrow="2. Tablica zespolowa"
        title="Podglad miesieczny"
        action={
          <div className="inline-flex w-fit items-center rounded-full border border-amber-200/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
            Miesiac: czerwiec 2026
          </div>
        }
      >
        <KpiOverviewStrip />
        <MasterDetailLayout
          showDetails={!!selectedMember}
          className="mt-6 min-h-0"
          list={
            <KpiTeamList
              selectedMemberId={selectedMemberId}
              onSelect={handleSelectMember}
            />
          }
          details={
            selectedMember ? (
              <KpiMemberDetails
                member={selectedMember}
                onCloseClick={closeMemberDetails}
              />
            ) : null
          }
        />
      </KpiSection>

      <MobileDetailSheet
        open={isMobileDetailsOpen && !!selectedMember}
        onOpenChange={(open) => {
          if (open) {
            setIsMobileDetailsOpen(true);
            return;
          }

          closeMemberDetails();
        }}
        eyebrow="Szczegoly KPI"
        title={selectedMember?.name ?? 'Wybrany pracownik'}
        closeLabel="Zamknij szczegoly KPI"
      >
        {selectedMember ? (
          <KpiMemberDetails member={selectedMember} variant="sheet" />
        ) : null}
      </MobileDetailSheet>
    </>
  );
};
