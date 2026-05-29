import { useState } from 'react';
import ItemName from './ItemName';
import { modalOverlay, modalBox, sectionLabel, rowBtn } from '../styles';
import {
  addItemToPreset, addCassetteToPreset,
  removeItemFromPreset, updateItemInPreset, reorderItemInPreset,
  deletePreset
} from '../services/presetService';

// Tag-based item groups rendered as collapsible sections inside Items
const TAG_GROUPS = [
  { tag: 'vitals',           label: 'Vitals',          color: '#ef4444' },
  { tag: 'drawer supplies',  label: 'Drawer Supplies', color: '#8b5cf6' },
  { tag: 'burs & polishers', label: 'Burs & Polishers', color: '#f59e0b' },
  { tag: 'x-ray equipment',  label: 'X-ray Equipment', color: '#0ea5e9' },
  { tag: 'endo files',       label: 'Endo Files',      color: '#ec4899' },
];

export default function PresetDetailModal({ preset, allItems, cassettes, presetsByGroup, say, refresh, onClose }) {
  const presetData = (presetsByGroup[preset.groupId] || []).find(p => p.id === preset.presetId);
  const presetItems = presetData?.items || [];
  const [search, setSearch] = useState('');
  const [addTab, setAddTab] = useState('supplies');
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue] = useState('');

  const supplies = allItems.filter(i => (i.type || 'supply') === 'supply');
  const instruments = allItems.filter(i => i.type === 'instrument');
  const burs = allItems.filter(i => i.type === 'burs_polishers');

  const filterList = (list) =>
    list.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const filterCassettes = () =>
    cassettes.filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()))
             .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const [expandedCassettes, setExpandedCassettes] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleCassette = (cassetteId) => {
    setExpandedCassettes(prev => ({ ...prev, [cassetteId]: !prev[cassetteId] }));
  };

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const cassetteItems = presetItems.filter(it => it.type === 'cassette');
  const regularItems = presetItems.filter(it => it.type !== 'cassette');

  // Helper: get lowercase tags for a preset item
  const getItemTags = (it) => {
    const inv = allItems.find(i => i.id === it.inventoryId);
    if (!inv) return [];
    const tags = (inv.tags || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const cat = (inv.category || '').trim().toLowerCase();
    if (cat && !tags.includes(cat)) tags.push(cat);
    return tags;
  };

  // Build grouped + ungrouped item lists
  const getName = (it) => {
    const inv = allItems.find(i => i.id === it.inventoryId);
    return (it.customName || inv?.name || '(unknown)').toLowerCase();
  };

  const groupedItemSets = TAG_GROUPS.map(g => ({
    ...g,
    items: regularItems.filter(it => getItemTags(it).includes(g.tag)).sort((a, b) => getName(a).localeCompare(getName(b))),
  }));
  const groupedIds = new Set(groupedItemSets.flatMap(g => g.items.map(it => presetItems.indexOf(it))));
  const ungroupedItems = regularItems.filter(it => !groupedIds.has(presetItems.indexOf(it))).sort((a, b) => getName(a).localeCompare(getName(b)));

  // Shared row renderer for items (used in both grouped and ungrouped lists)
  const renderItemRow = (it, idx, { indented } = {}) => {
    const realIdx = presetItems.indexOf(it);
    const inv = allItems.find(i => i.id === it.inventoryId);
    return (
      <li key={idx} style={{
        padding: indented ? '5px 12px 5px 24px' : '5px 0',
        borderBottom: `1px solid ${indented ? '#e5e7eb' : '#f0f0f0'}`,
        display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap'
      }}>
        <span style={{ flex: 1 }}>
          <strong>{(it.quantity || 1) > 1 && `${it.quantity}× `}<ItemName name={it.customName || inv?.name || '(unknown)'} /></strong>
          {it.customName && inv && <span style={{ color: '#aaa', fontSize: 11 }}> (<ItemName name={inv.name} />)</span>}
          {it.notes && <span style={{ color: '#888', fontSize: 11, marginLeft: 6, fontStyle: 'italic' }}>— {it.notes}</span>}
        </span>
        <button onClick={async () => {
          await updateItemInPreset(preset.groupId, preset.presetId, realIdx, { quantity: (it.quantity || 1) + 1 });
          refresh();
        }} style={rowBtn}>+</button>
        <button onClick={async () => {
          const newQty = (it.quantity || 1) - 1;
          if (newQty < 1) {
            await removeItemFromPreset(preset.groupId, preset.presetId, realIdx);
            say('Removed item');
          } else {
            await updateItemInPreset(preset.groupId, preset.presetId, realIdx, { quantity: newQty });
          }
          refresh();
        }} style={rowBtn}>−</button>
        <button onClick={() => {
          setEditingNote(realIdx);
          setNoteValue(it.notes || '');
        }} style={rowBtn}>Note</button>
        <button onClick={async () => {
          const newName = prompt('Custom name (blank = use original):', it.customName || '');
          if (newName === null) return;
          await updateItemInPreset(preset.groupId, preset.presetId, realIdx, { customName: newName });
          refresh();
        }} style={rowBtn}>Rename</button>
        <button onClick={async () => {
          await removeItemFromPreset(preset.groupId, preset.presetId, realIdx);
          say('Removed item');
          refresh();
        }} style={{ fontSize: 11, color: 'red' }}>Remove</button>
      </li>
    );
  };

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Setup List: {preset.name}</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={async () => {
              if (!confirm(`Delete setup list "${preset.name}"? This cannot be undone.`)) return;
              await deletePreset(preset.groupId, preset.presetId);
              say(`Deleted setup list: ${preset.name}`);
              refresh();
              onClose();
            }} style={{ color: 'red', fontSize: 12 }}>Delete List</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>

        {/* Cassettes in preset */}
        <div style={{ marginTop: 15 }}>
          <div style={sectionLabel}>
            Cassettes ({cassetteItems.length})
          </div>
          {cassetteItems.length === 0 && (
            <p style={{ color: '#aaa', fontSize: 13, margin: '4px 0' }}>No cassettes. Use the <strong>Cassettes</strong> tab below to add one.</p>
          )}
          {cassetteItems.map((it, idx) => {
            const realIdx = presetItems.indexOf(it);
            const cassette = cassettes.find(c => c.id === it.cassetteId);
            const isExpanded = expandedCassettes[it.cassetteId];
            const cassetteInstruments = (cassette?.instrumentIds || [])
              .map(instId => allItems.find(i => i.id === instId))
              .filter(Boolean);
            return (
              <div key={idx} style={{ marginBottom: 4 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', background: '#f9f9f9',
                  borderRadius: isExpanded ? '4px 4px 0 0' : 4,
                  borderLeft: `4px solid ${cassette?.color || '#ccc'}`,
                  cursor: 'pointer'
                }} onClick={() => toggleCassette(it.cassetteId)}>
                  <span style={{
                    fontSize: 10, transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    display: 'inline-block'
                  }}>▶</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>
                    <ItemName name={cassette?.name || '(deleted cassette)'} />
                  </span>
                  <span style={{ fontSize: 11, color: '#888' }}>
                    {cassetteInstruments.length} instruments
                  </span>
                  <button onClick={async (e) => {
                    e.stopPropagation();
                    await removeItemFromPreset(preset.groupId, preset.presetId, realIdx);
                    say('Removed cassette from preset');
                    refresh();
                  }} style={{ fontSize: 11, color: 'red' }}>Remove</button>
                </div>
                {isExpanded && cassetteInstruments.length > 0 && (
                  <div style={{
                    background: '#f3f4f6', borderRadius: '0 0 4px 4px',
                    borderLeft: `4px solid ${cassette?.color || '#ccc'}`,
                    padding: '4px 0'
                  }}>
                    {cassetteInstruments.map((inst, iIdx) => (
                      <div key={iIdx} style={{
                        padding: '3px 12px 3px 28px', fontSize: 12,
                        color: '#555', display: 'flex', alignItems: 'center', gap: 6
                      }}>
                        <span style={{ color: '#aaa', fontSize: 10 }}>•</span>
                        <ItemName name={inst.name} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Regular items in preset */}
        <div style={{ marginTop: 15 }}>
          <div style={sectionLabel}>
            Items ({regularItems.length})
          </div>
          {regularItems.length === 0 && (
            <p style={{ color: '#aaa', fontSize: 13 }}>No items yet. Add from below.</p>
          )}

          {/* Tag-based collapsible groups */}
          {groupedItemSets.map(group => group.items.length > 0 && (
            <div key={group.tag} style={{ marginBottom: 8 }}>
              <div
                onClick={() => toggleGroup(group.tag)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', background: '#f9f9f9',
                  borderRadius: expandedGroups[group.tag] ? '4px 4px 0 0' : 4,
                  borderLeft: `4px solid ${group.color}`,
                  cursor: 'pointer', userSelect: 'none'
                }}
              >
                <span style={{
                  fontSize: 10, transition: 'transform 0.2s',
                  transform: expandedGroups[group.tag] ? 'rotate(90deg)' : 'rotate(0deg)',
                  display: 'inline-block'
                }}>▶</span>
                <span style={{ flex: 1, fontWeight: 500 }}>
                  {group.label}
                </span>
                <span style={{ fontSize: 11, color: '#888' }}>
                  {group.items.length} items
                </span>
              </div>
              {expandedGroups[group.tag] && (
                <div style={{
                  background: '#f3f4f6', borderRadius: '0 0 4px 4px',
                  borderLeft: `4px solid ${group.color}`,
                  padding: '4px 0'
                }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {group.items.map((it, idx) => renderItemRow(it, idx, { indented: true }))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Ungrouped regular items */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {ungroupedItems.map((it, idx) => renderItemRow(it, idx))}
          </ul>
        </div>

        {/* Note editor */}
        {editingNote !== null && (
          <div style={{ marginTop: 10, padding: 10, background: '#fffbeb', borderRadius: 4, border: '1px solid #fde68a' }}>
            <strong style={{ fontSize: 12 }}>Note for item:</strong>
            <input
              value={noteValue}
              onChange={e => setNoteValue(e.target.value)}
              placeholder="e.g. check expiry, use 2 of these..."
              style={{ width: '100%', padding: 6, marginTop: 4 }}
              autoFocus
            />
            <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
              <button onClick={async () => {
                await updateItemInPreset(preset.groupId, preset.presetId, editingNote, { notes: noteValue });
                setEditingNote(null);
                refresh();
              }}>Save Note</button>
              <button onClick={() => setEditingNote(null)}>Cancel</button>
            </div>
          </div>
        )}

        <hr style={{ margin: '15px 0' }} />

        {/* Add section */}
        <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Add to preset</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {['supplies', 'instruments', 'burs_polishers', 'cassettes'].map(t => (
            <button key={t} onClick={() => { setAddTab(t); setSearch(''); }}
              style={{
                fontSize: 12, padding: '4px 10px',
                background: addTab === t ? '#333' : '#eee',
                color: addTab === t ? 'white' : '#333',
              }}>
              {t === 'burs_polishers' ? 'Burs & Polishers' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <input
          placeholder={`Search ${addTab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: 6, marginBottom: 8 }}
        />

        <div style={{ maxHeight: 220, overflow: 'auto', fontSize: 13 }}>
          
          {addTab === 'burs_polishers' && filterList(burs).map(i => (
            <div key={i.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f0f0f0'
            }}>
              <div>
                <div>{i.name}</div>
                {i.category && <div style={{ fontSize: 11, color: '#888' }}>{i.category}</div>}
              </div>
              <button onClick={async () => {
                await updatePreset(preset.groupId, preset.presetId, {
                  items: [...preset.items, { type: 'item', inventoryId: i.id, customName: '', notes: '', quantity: 1 }]
                });
                say(`Added ${i.name}`);
                refresh();
              }} style={{ padding: '3px 8px', fontSize: 11 }}>+ Add</button>
            </div>
          ))}

          {addTab === 'cassettes' && filterCassettes().map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 0', borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: '#888' }}>{c.instrumentIds?.length || 0} instruments</span>
              <button onClick={async () => {
                try {
                  await addCassetteToPreset(preset.groupId, preset.presetId, c.id);
                  say(`Added cassette: ${c.name}`);
                  refresh();
                } catch (e) {
                  say(e.message);
                }
              }} style={rowBtn}>+ Add</button>
            </div>
          ))}

          {(addTab === 'supplies' ? filterList(supplies) : filterList(instruments)).map(i => (
            <div key={i.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 0', borderBottom: '1px solid #f0f0f0'
            }}>
              <span style={{ flex: 1 }}>{i.name}</span>
              <span style={{ fontSize: 11, color: '#888' }}>{i.category}</span>
              <button onClick={async () => {
                await addItemToPreset(preset.groupId, preset.presetId, i.id);
                say(`Added: ${i.name}`);
                refresh();
              }} style={rowBtn}>+ Add</button>
            </div>
          ))}

          {addTab === 'cassettes' && filterCassettes().length === 0 && (
            <em style={{ color: '#aaa' }}>No cassettes found</em>
          )}
          {addTab !== 'cassettes' && filterList(addTab === 'supplies' ? supplies : instruments).length === 0 && (
            <em style={{ color: '#aaa' }}>No items found</em>
          )}
        </div>
      </div>
    </div>
  );
}