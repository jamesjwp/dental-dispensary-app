import { useState } from 'react';
import {
  addItemToPreset, addCassetteToPreset,
  removeItemFromPreset, updateItemInPreset, reorderItemInPreset
} from '../services/presetService';

export default function PresetDetailModal({ preset, allItems, cassettes, presetsByGroup, say, refresh, onClose }) {
  const presetData = (presetsByGroup[preset.groupId] || []).find(p => p.id === preset.presetId);
  const presetItems = presetData?.items || [];
  const [search, setSearch] = useState('');
  const [addTab, setAddTab] = useState('supplies'); // 'supplies' | 'instruments' | 'cassettes'
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue] = useState('');

  const supplies = allItems.filter(i => (i.type || 'supply') === 'supply');
  const instruments = allItems.filter(i => i.type === 'instrument');

  const filterList = (list) =>
    list.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase()));

  const filterCassettes = () =>
    cassettes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  // Separate preset items into cassettes and regular items
  const cassetteItems = presetItems.filter(it => it.type === 'cassette');
  const regularItems = presetItems.filter(it => it.type !== 'cassette');

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100
    }}>
      <div style={{
        background: 'white', color: '#333', padding: 20, borderRadius: 6,
        maxWidth: 750, width: '95%', maxHeight: '90vh', overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Setup List: {preset.name}</h3>
          <button onClick={onClose}>Close</button>
        </div>

        {/* Cassettes in preset */}
        {cassetteItems.length > 0 && (
          <div style={{ marginTop: 15 }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>
              Cassettes ({cassetteItems.length})
            </div>
            {cassetteItems.map((it, idx) => {
              const realIdx = presetItems.indexOf(it);
              const cassette = cassettes.find(c => c.id === it.cassetteId);
              return (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', background: '#f9f9f9',
                  borderRadius: 4, marginBottom: 4,
                  borderLeft: `4px solid ${cassette?.color || '#ccc'}`
                }}>
                  <span style={{ flex: 1, fontWeight: 500 }}>
                    📦 {cassette?.name || '(deleted cassette)'}
                  </span>
                  <span style={{ fontSize: 11, color: '#888' }}>
                    {cassette?.instrumentIds?.length || 0} instruments
                  </span>
                  <button onClick={async () => {
                    await removeItemFromPreset(preset.groupId, preset.presetId, realIdx);
                    say('Removed cassette from preset');
                    refresh();
                  }} style={{ fontSize: 11, color: 'red' }}>Remove</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Regular items in preset */}
        <div style={{ marginTop: 15 }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>
            Items ({regularItems.length})
          </div>
          {regularItems.length === 0 && (
            <p style={{ color: '#aaa', fontSize: 13 }}>No items yet. Add from below.</p>
          )}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {regularItems.map((it, idx) => {
              const realIdx = presetItems.indexOf(it);
              const inv = allItems.find(i => i.id === it.inventoryId);
              return (
                <li key={idx} style={{
                  padding: '5px 0', borderBottom: '1px solid #f0f0f0',
                  display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap'
                }}>
                  <span style={{ flex: 1 }}>
                    <strong>{(it.quantity || 1) > 1 && `${it.quantity}× `}{it.customName || inv?.name || '(unknown)'}</strong>
                    {it.customName && inv && <span style={{ color: '#aaa', fontSize: 11 }}> ({inv.name})</span>}
                    {it.notes && <span style={{ color: '#888', fontSize: 11, marginLeft: 6, fontStyle: 'italic' }}>— {it.notes}</span>}
                  </span>
                  <button onClick={async () => {
                    await updateItemInPreset(preset.groupId, preset.presetId, realIdx, { quantity: (it.quantity || 1) + 1 });
                    refresh();
                  }} style={{ fontSize: 11 }}>+</button>
                  <button onClick={async () => {
                    const newQty = (it.quantity || 1) - 1;
                    if (newQty < 1) {
                      await removeItemFromPreset(preset.groupId, preset.presetId, realIdx);
                      say('Removed item');
                    } else {
                      await updateItemInPreset(preset.groupId, preset.presetId, realIdx, { quantity: newQty });
                    }
                    refresh();
                  }} style={{ fontSize: 11 }}>−</button>
                  <button onClick={async () => {
                    await reorderItemInPreset(preset.groupId, preset.presetId, realIdx, realIdx - 1);
                    refresh();
                  }} disabled={realIdx === 0} style={{ fontSize: 11 }}>Up</button>
                  <button onClick={async () => {
                    await reorderItemInPreset(preset.groupId, preset.presetId, realIdx, realIdx + 1);
                    refresh();
                  }} disabled={realIdx === presetItems.length - 1} style={{ fontSize: 11 }}>Down</button>
                  <button onClick={() => {
                    setEditingNote(realIdx);
                    setNoteValue(it.notes || '');
                  }} style={{ fontSize: 11 }}>Note</button>
                  <button onClick={async () => {
                    const newName = prompt('Custom name (blank = use original):', it.customName || '');
                    if (newName === null) return;
                    await updateItemInPreset(preset.groupId, preset.presetId, realIdx, { customName: newName });
                    refresh();
                  }} style={{ fontSize: 11 }}>Rename</button>
                  <button onClick={async () => {
                    await removeItemFromPreset(preset.groupId, preset.presetId, realIdx);
                    say('Removed item');
                    refresh();
                  }} style={{ fontSize: 11, color: 'red' }}>Remove</button>
                </li>
              );
            })}
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
          {['supplies', 'instruments', 'cassettes'].map(t => (
            <button key={t} onClick={() => { setAddTab(t); setSearch(''); }}
              style={{
                fontSize: 12, padding: '4px 10px',
                background: addTab === t ? '#333' : '#eee',
                color: addTab === t ? 'white' : '#333',
              }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
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
              }} style={{ fontSize: 11 }}>+ Add</button>
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
              }} style={{ fontSize: 11 }}>+ Add</button>
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