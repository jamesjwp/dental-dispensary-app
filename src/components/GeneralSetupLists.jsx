import { createPreset, createGroup } from '../services/presetService';

const GENERAL_GROUP_NAME = 'General Setup Lists';

export default function GeneralSetupLists({ groups, presetsByGroup, items, cassettes, say, refresh, onOpenPreset }) {
  const generalGroup = groups.find(g => g.name === GENERAL_GROUP_NAME);
  const presets = generalGroup ? (presetsByGroup[generalGroup.id] || []) : [];

  const handleAddList = async () => {
    const name = prompt('New setup list name:');
    if (!name) return;
    let groupId = generalGroup?.id;
    if (!groupId) {
      const newGroup = await createGroup(GENERAL_GROUP_NAME);
      groupId = newGroup.id;
    }
    await createPreset(groupId, name);
    say(`Created setup list: ${name}`);
    refresh();
  };

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <h2 className="page-title">General Setup Lists</h2>
        <p className="page-subtitle">Default grab lists for procedure setup. Each list can be customized.</p>
      </div>

      <div className="setup-grid">
        {presets.map(p => (
          <SetupCard
            key={p.id}
            preset={p}
            groupId={generalGroup.id}
            items={items}
            cassettes={cassettes}
            onOpen={() => onOpenPreset({ groupId: generalGroup.id, presetId: p.id, name: p.name })}
          />
        ))}
        <div
          className="setup-card setup-card-add"
          onClick={handleAddList}
          title="Add new setup list"
        >
          <span className="setup-card-add-icon">+</span>
        </div>
      </div>
    </div>
  );
}

function SetupCard({ preset, groupId, items, cassettes, onOpen }) {
  const presetItems = preset.items || [];
  const cassetteItems = presetItems.filter(it => it.type === 'cassette');
  const regularItems = presetItems.filter(it => it.type !== 'cassette');

  const supplyCount = regularItems.length;
  const cassetteCount = cassetteItems.length;

  // Order: cassettes' instruments grouped together, then regular supplies
  const chipData = [];

  // Add instruments from cassettes (grouped by cassette)
  cassetteItems.forEach(ci => {
    const cassette = cassettes.find(c => c.id === ci.cassetteId);
    if (!cassette) return;
    (cassette.instrumentIds || []).forEach(instId => {
      const inst = items.find(i => i.id === instId);
      if (inst) chipData.push({ label: inst.name, fromCassette: cassette.name });
    });
  });

  // Add regular items
  regularItems.forEach(it => {
    const inv = items.find(i => i.id === it.inventoryId);
    chipData.push({ label: it.customName || inv?.name || '(unknown)' });
  });

  const MAX_CHIPS = 5;
  const visibleChips = chipData.slice(0, MAX_CHIPS);
  const remaining = chipData.length - MAX_CHIPS;

  return (
    <div className="setup-card" onClick={onOpen}>
      <div className="setup-card-header">
        <h3>{preset.name}</h3>
        <div className="setup-card-cassettes">
          {cassetteItems.map((ci, idx) => {
            const c = cassettes.find(cc => cc.id === ci.cassetteId);
            return <span key={idx} className="cassette-dot" style={{ background: c?.color || '#ccc' }} title={c?.name} />;
          })}
        </div>
      </div>
      <div className="setup-card-stats">
        {supplyCount} supplies • {cassetteCount} cassette{cassetteCount !== 1 ? 's' : ''}
      </div>
      <div className="item-chips">
        {visibleChips.map((chip, idx) => (
          <span key={idx} className="item-chip" title={chip.fromCassette ? `From ${chip.fromCassette} cassette` : ''}>
            {chip.label}
          </span>
        ))}
        {remaining > 0 && <span className="item-chip item-chip-more">+{remaining} more</span>}
      </div>
    </div>
  );
}