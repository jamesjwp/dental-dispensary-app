import { useState } from 'react';
import { sectionStyle } from '../styles';
import { seedCassettes } from '../services/seedService';
import {
  addCassette, updateCassette, deleteCassette,
  addInstrumentToCassette, removeInstrumentFromCassette,
  CASSETTE_COLORS
} from '../services/cassetteService';

export default function CassettesSection({ cassettes, items, say, refresh }) {
  const [expanded, setExpanded] = useState(null); // cassette id being viewed
  const [search, setSearch] = useState('');

  // Only show items marked as instruments
  const instruments = items.filter(i => i.type === 'instrument');

  const create = async () => {
    const name = prompt('Cassette name?'); if (!name) return;
    await addCassette({ name, color: CASSETTE_COLORS[0].value });
    say(`Created cassette: ${name}`);
    refresh();
  };

  return (
    <section style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Cassettes ({cassettes.length})</h3>
        <div>
          <button onClick={async () => {
            if (!confirm('Seed cassettes? This will DELETE all existing cassettes and create the 5 defaults.')) return;
            const results = await seedCassettes();
            const summary = results.map(r => `${r.name}: ${r.added} added${r.missing.length ? `, ${r.missing.length} missing` : ''}`).join('\n');
            say(`Seeded ${results.length} cassettes`);
            console.log('Seed results:', results);
            alert(summary);
            refresh();
          }} style={{ marginRight: 8, background: '#fef3c7' }}>🌱 Seed Defaults</button>
          <button onClick={async () => {
            if (!confirm('Delete ALL cassettes?')) return;
            const { getAllCassettes, deleteCassette } = await import('../services/cassetteService');
            const all = await getAllCassettes();
            await Promise.all(all.map(c => deleteCassette(c.id)));
            say('Deleted all cassettes');
            refresh();
          }} style={{ color: 'red', marginRight: 8 }}>Delete All</button>
          <button onClick={create}>+ New Cassette</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginTop: 12 }}>
        {cassettes.map(c => (
          <CassetteCard
            key={c.id}
            cassette={c}
            instruments={instruments}
            isExpanded={expanded === c.id}
            onToggleExpand={() => setExpanded(expanded === c.id ? null : c.id)}
            search={search}
            setSearch={setSearch}
            say={say}
            refresh={refresh}
          />
        ))}
        {cassettes.length === 0 && (
          <p style={{ color: '#888' }}>No cassettes yet. Click "+ New Cassette" to start.</p>
        )}
      </div>
    </section>
  );
}

function CassetteCard({ cassette, instruments, isExpanded, onToggleExpand, search, setSearch, say, refresh }) {
  const contents = (cassette.instrumentIds || []).map(id => instruments.find(i => i.id === id)).filter(Boolean);
  const colorObj = CASSETTE_COLORS.find(c => c.value === cassette.color) || CASSETTE_COLORS[0];

  const filteredAvailable = instruments.filter(i =>
    !cassette.instrumentIds?.includes(i.id) &&
    (i.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      background: 'white',
      color: '#222',
      borderRadius: 6,
      overflow: 'hidden',
      border: '1px solid #ddd',
    }}>
      <div style={{ height: 4, background: cassette.color }} />
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <strong>{cassette.name}</strong>
            <span style={{
              marginLeft: 8,
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 10,
              background: cassette.color,
              color: 'white',
              textTransform: 'uppercase'
            }}>{colorObj.name}</span>
          </div>
        </div>
        {cassette.description && <div style={{ fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 4 }}>{cassette.description}</div>}

        <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginTop: 10 }}>
          Contents ({contents.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {contents.length === 0 && <em style={{ color: '#aaa', fontSize: 12 }}>No instruments assigned.</em>}
          {contents.map(inst => (
            <span key={inst.id} style={{
              fontSize: 11, padding: '2px 8px', background: '#eee', borderRadius: 12, color: '#333'
            }}>
              {inst.name}
              {isExpanded && (
                <button
                  onClick={async () => {
                    await removeInstrumentFromCassette(cassette.id, inst.id, cassette.instrumentIds || []);
                    refresh();
                  }}
                  style={{ marginLeft: 4, fontSize: 10, padding: '0 4px', background: 'transparent', border: 'none', color: '#c00', cursor: 'pointer' }}
                  title="Remove"
                >×</button>
              )}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button onClick={onToggleExpand} style={{ fontSize: 11 }}>
            {isExpanded ? 'Done' : 'Edit'}
          </button>
          <button onClick={async () => {
            const newName = prompt('Rename cassette:', cassette.name);
            if (!newName) return;
            await updateCassette(cassette.id, { name: newName });
            say(`Renamed: ${newName}`);
            refresh();
          }} style={{ fontSize: 11 }}>Rename</button>
          <button onClick={async () => {
            if (!confirm(`Delete cassette "${cassette.name}"?`)) return;
            await deleteCassette(cassette.id);
            say(`Deleted: ${cassette.name}`);
            refresh();
          }} style={{ fontSize: 11, color: 'red' }}>Delete</button>
        </div>

        {isExpanded && (
          <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 10 }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Color</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
              {CASSETTE_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={async () => {
                    await updateCassette(cassette.id, { color: c.value });
                    refresh();
                  }}
                  style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: c.value, border: cassette.color === c.value ? '2px solid #000' : '1px solid #ccc',
                    cursor: 'pointer', padding: 0,
                  }}
                  title={c.name}
                />
              ))}
            </div>

            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Add instruments</div>
            <input
              placeholder="Search instruments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: 4, fontSize: 12, marginBottom: 6 }}
            />
            <div style={{ maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
              {filteredAvailable.slice(0, 30).map(inst => (
                <div key={inst.id} style={{ padding: 2 }}>
                  <button
                    onClick={async () => {
                      await addInstrumentToCassette(cassette.id, inst.id, cassette.instrumentIds || []);
                      refresh();
                    }}
                    style={{ fontSize: 11 }}
                  >+</button>
                  <span style={{ marginLeft: 6 }}>{inst.name}</span>
                </div>
              ))}
              {filteredAvailable.length > 30 && <em style={{ color: '#aaa' }}>...{filteredAvailable.length - 30} more, keep typing to narrow</em>}
              {filteredAvailable.length === 0 && (
                <em style={{ color: '#aaa' }}>
                  {instruments.length === 0 ? 'No instruments in inventory yet. Add items with type "instrument".' : 'All matching instruments are already in this cassette.'}
                </em>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}