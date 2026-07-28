import { McqGameRunner } from '../shared/McqGameRunner';

const ACHIEVEMENT_ICONS = {
  'junior-bug-hunter': { title: 'Junior Bug Hunter', icon: 'bi-bug' },
  'debug-master': { title: 'Debug Master', icon: 'bi-award' },
  'bug-slayer': { title: 'Bug Slayer', icon: 'bi-trophy' },
};

export default function BugHunter() {
  return (
    <McqGameRunner
      game="bug-hunter"
      title="Bug Hunter"
      icon="bi-bug"
      loadingLabel="Menyiapkan potongan kode bermasalah..."
      achievementIcons={ACHIEVEMENT_ICONS}
    />
  );
}