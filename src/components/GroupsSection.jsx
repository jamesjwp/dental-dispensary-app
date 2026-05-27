import { useState } from 'react';
import { sectionStyle } from '../styles';
import { createGroup, renameGroup, deleteGroup, createPreset, renamePreset, deletePreset, duplicatePreset } from '../services/presetService';

export default function GroupsSection({ groups, presetsByGroup, items, say, refresh, onOpenPreset }) {
  return (
    <section style={sectionStyle}>
      <h3>Preset Groups ({groups.length})</h3>
      <button onClick={async () => {
        const name = prompt('Group name?'); if (!name) return;
        await createGroup(name);
        say(`Created group: ${name}`);
        refresh();
      }}>+ New Group</button>

      {groups.map(g => (
        <div key={g.id} style={{ marginTop: 10, padding: 10, background: '#fafafa', color: '#333', borderRadius: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{g.name}</strong>
            <div>
              <button onClick={async () => {
                const newName = prompt('Rename group:', g.name); if (!newName) return;
                await renameGroup(g.id, newName);
                say(`Renamed group to ${newName}`);
                refresh();
              }}>Rename</button>
              <button onClick={async () => {
                if (!confirm(`Delete group "${g.name}"? Its presets will be orphaned.`)) return;
                await deleteGroup(g.id);
                say(`Deleted group: ${g.name}`);
                refresh();
              }} style={{ color: 'red' }}>Delete</button>
              <button onClick={async () => {
                const name = prompt('Preset name?'); if (!name) return;
                await createPreset(g.id, name);
                say(`Created preset "${name}" in ${g.name}`);
                refresh();
              }}>+ Preset</button>
            </div>
          </div>
          <ul style={{ marginTop: 5 }}>
            {(presetsByGroup[g.id] || []).map(p => (
              <li key={p.id} style={{ marginTop: 3 }}>
                <button onClick={() => onOpenPreset({ groupId: g.id, presetId: p.id, name: p.name })}
                  style={{ background: 'none', border: 'none', color: '#0066cc', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                  {p.name}
                </button>
                <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>({p.items?.length || 0} items)</span>
                <button onClick={async () => {
                    await duplicatePreset(g.id, p.id);
                    say(`Duplicated preset: ${p.name}`);
                    refresh();
                    }} style={{ marginLeft: 8, fontSize: 11 }}>Duplicate</button>
                <button onClick={async () => {
                  if (!confirm(`Delete preset "${p.name}"?`)) return;
                  await deletePreset(g.id, p.id);
                  say(`Deleted preset: ${p.name}`);
                  refresh();
                }} style={{ marginLeft: 4, fontSize: 11, color: 'red' }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}