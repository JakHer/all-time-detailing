import {
  getMemberScore,
  getScoreStatus,
  teamMembers,
  type TeamMember,
} from '../../data/kpi';
import { SelectableListItem } from '../entity/SelectableListItem';
import { surfaceStyles, textStyles } from '../design/styles';

type KpiTeamListProps = {
  selectedMemberId: string | null;
  onSelect: (memberId: string) => void;
};

export const KpiTeamList = ({
  selectedMemberId,
  onSelect,
}: KpiTeamListProps) => {
  return (
    <article className={surfaceStyles.entityList}>
      <div className="hidden items-end justify-between gap-3 sm:flex">
        <div>
          <p className={textStyles.eyebrowAmber}>Lista pracownikow</p>
          <h3 className={textStyles.listTitle}>Oceny miesieczne</h3>
        </div>
        <div className="text-xs text-stone-400">{teamMembers.length} osoby</div>
      </div>

      <div className="mb-3 flex items-center justify-between sm:hidden">
        <p className={textStyles.eyebrowMuted}>Lista pracownikow</p>
        <div className="text-xs text-stone-400">{teamMembers.length} osoby</div>
      </div>

      <div className="grid gap-2.5 sm:mt-3">
        {teamMembers.map((member) => (
          <TeamMemberListItem
            key={member.id}
            member={member}
            isActive={member.id === selectedMemberId}
            onSelect={() => onSelect(member.id)}
          />
        ))}
      </div>
    </article>
  );
};

const TeamMemberListItem = ({
  member,
  isActive,
  onSelect,
}: {
  member: TeamMember;
  isActive: boolean;
  onSelect: () => void;
}) => {
  const score = getMemberScore(member);
  const status = getScoreStatus(score);

  return (
    <SelectableListItem
      onClick={onSelect}
      isActive={isActive}
      mobileLeading={<KpiStatusDot status={status} />}
      mobileBody={
        <div className="min-w-0">
          <p className={textStyles.entityTitle}>{member.name}</p>
          <p className={textStyles.entityMeta}>{member.role}</p>
        </div>
      }
      mobileTrailing={<KpiListScore score={score} />}
      desktopLeading={<KpiStatusDot status={status} />}
      desktopBody={
        <div className="min-w-0">
          <p className={textStyles.entityTitle}>{member.name}</p>
          <p className={textStyles.entityMeta}>{member.role}</p>
        </div>
      }
      desktopTrailing={
        <div className="grid justify-items-end gap-1">
          <p className="truncate text-xs text-stone-300">{score} / 100</p>
          <p className={`truncate text-[11px] ${status.textClassName}`}>
            {status.label}
          </p>
        </div>
      }
    />
  );
};

const KpiStatusDot = ({
  status,
}: {
  status: ReturnType<typeof getScoreStatus>;
}) => {
  return (
    <div
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.dotClassName}`}
      aria-hidden="true"
    />
  );
};

const KpiListScore = ({ score }: { score: number }) => {
  return <p className="truncate text-xs text-stone-300">{score} pkt</p>;
};
