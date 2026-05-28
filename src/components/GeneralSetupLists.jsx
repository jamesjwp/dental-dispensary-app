import { useState } from 'react';
import ItemName from './ItemName';
import { createPreset, createGroup, deletePreset } from '../services/presetService';
import { PROCEDURAL_LIST_NAMES, seedSingleProceduralList, seedProceduralSetupLists } from '../services/seedService';

const GENERAL_GROUP_NAME = 'General Setup Lists';

export default function GeneralSetupLists({ groups, presetsByGroup, items, cassettes, say, refresh, onOpenPreset }) {
  const generalGroup = groups.find(g => g.name === GENERAL_GROUP_NAME);
  const rawPresets = generalGroup ? (presetsByGroup[generalGroup.id] || []) : [];
  const [search, setSearch] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const ordered = [...rawPresets].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const presets = ordered.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const existingNames = new Set(rawPresets.map(p => p.name));
  const missingDefaults = PROCEDURAL_LIST_NAMES.filter(n => !existingNames.has(n));

  const ensureGroupId = async () => {
    let groupId = generalGroup?.id;
    if (!groupId) {
      const newGroup = await createGroup(GENERAL_GROUP_NAME);
      groupId = newGroup.id;
    }
    return groupId;
  };

  const handleCreateNew = async () => {
    setShowAddMenu(false);
    const name = prompt('New setup list name:');
    if (!name) return;
    const groupId = await ensureGroupId();
    await createPreset(groupId, name, [], ordered.length);
    say(`Created setup list: ${name}`);
    refresh();
  };

  const handleRestoreDefault = async (name) => {
    setShowAddMenu(false);
    try {
      await seedSingleProceduralList(name);
      say(`Restored default list: ${name}`);
      refresh();
    } catch (e) {
      say(e.message);
      alert(e.message);
    }
  };

  const handleDeleteAll = async () => {
    if (rawPresets.length === 0) return;
    if (window.confirm('Are you sure you want to delete ALL setup lists? This cannot be undone.')) {
      say('Deleting all setup lists...');
      await Promise.all(rawPresets.map(p => deletePreset(generalGroup.id, p.id)));
      say('All setup lists deleted.');
      refresh();
    }
  };

  const handleSeedDefaults = async () => {
    say('Seeding default setup lists...');
    try {
      await seedProceduralSetupLists();
      say('Default setup lists seeded.');
      refresh();
    } catch (e) {
      say(e.message);
      alert(e.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="page-title">General Setup Lists</h2>
            <p className="page-subtitle">Default grab lists for procedure setup. Each list can be customized.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSeedDefaults}
              style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
            >
              Seed Defaults
            </button>
            {rawPresets.length > 0 && (
              <button
                onClick={handleDeleteAll}
                style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
              >
                Delete All Lists
              </button>
            )}
          </div>
        </div>
        <input
          placeholder="Search setup lists..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 360, padding: 8, marginTop: 8 }}
        />
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
        {!search && (
          <div
            className="setup-card setup-card-add"
            onClick={() => setShowAddMenu(true)}
            title="Add setup list"
          >
            <span className="setup-card-add-icon">+</span>
          </div>
        )}
        {search && presets.length === 0 && (
          <p style={{ color: '#888' }}>No setup lists match "{search}".</p>
        )}
      </div>

      {showAddMenu && (
        <div
          onClick={() => setShowAddMenu(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', color: '#333', padding: 20, borderRadius: 8, width: 360, maxWidth: '90%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Add Setup List</h3>
              <button onClick={() => setShowAddMenu(false)}>Close</button>
            </div>

            <button
              onClick={handleCreateNew}
              style={{ width: '100%', padding: 10, marginBottom: 16, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6 }}
            >
              + Create new blank list
            </button>

            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>
              Restore a default list
            </div>
            {missingDefaults.length === 0 && (
              <p style={{ color: '#aaa', fontSize: 13, margin: '4px 0' }}>All default lists are already present.</p>
            )}
            {missingDefaults.map(name => (
              <div
                key={name}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}
              >
                <span>{name}</span>
                <button onClick={() => handleRestoreDefault(name)} style={{ fontSize: 12 }}>+ Add</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SetupCard({ preset, groupId, items, cassettes, onOpen }) {
  const presetItems = preset.items || [];
  const cassetteItems = presetItems.filter(it => it.type === 'cassette');
  const regularItems = presetItems.filter(it => it.type !== 'cassette');

  const supplyCount = regularItems.length;
  const cassetteCount = cassetteItems.length;

  const chipData = [];

  cassetteItems.forEach(ci => {
    const cassette = cassettes.find(c => c.id === ci.cassetteId);
    if (!cassette) return;
    (cassette.instrumentIds || []).forEach(instId => {
      const inst = items.find(i => i.id === instId);
      if (inst) chipData.push({ label: inst.name, fromCassette: cassette.name });
    });
  });

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
            <ItemName name={chip.label} />
          </span>
        ))}
        {remaining > 0 && <span className="item-chip item-chip-more">+{remaining} more</span>}
      </div>
    </div>
  );
}