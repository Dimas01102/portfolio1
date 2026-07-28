import { McqGameRunner } from '../shared/McqGameRunner';

const ACHIEVEMENT_ICONS = {
  'output-master': { title: 'Output Master', icon: 'bi-cpu' },
};

export default function CodeOutputChallenge() {
  return (
    <McqGameRunner
      game="code-output"
      title="Code Output Challenge"
      icon="bi-terminal"
      loadingLabel="Menyiapkan potongan kode untuk ditebak outputnya..."
      achievementIcons={ACHIEVEMENT_ICONS}
    />
  );
}