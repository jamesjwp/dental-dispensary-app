import { useState } from 'react';
import ItemName from './ItemName';
import { sectionStyle, cellStyle } from '../styles';
import { importCSV, addItem, updateItem, deleteItem, deleteAllItems, restoreItem } from '../services/inventoryService';

const parseTags = (str) => (str || '').split(',').map(t => t.trim()).filter(Boolean);

export default function InventorySection({ items, say, refresh, showArchived, setShowArchived }) {
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', type: '' });
  const [selectedTags, setSelectedTags] = useState([]);
  const [sort, setSort] = useState({ column: 'name', direction: 'asc' });
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const startEdit = (item) => {
    setEditing(item.id);
    setEditForm({ ...item });
  };
  const saveEdit = async () => {
    const { id, createdAt, ...updates } = editForm;
    await updateItem(editing, updates);
    say(`Updated: ${updates.name || editing}`);
    setEditing(null);
    refresh();
  };
  const remove = async (item) => {
    if (!confirm(`Archive "${item.name || item.id}"?`)) return;
    await deleteItem(item.id);
    say(`Archived: ${item.name || item.id}`);
    refresh();
  };

  const toggleSort = (column) => {
    if (sort.column !== column) setSort({ column, direction: 'asc' });
    else if (sort.direction === 'asc') setSort({ column, direction: 'desc' });
    else setSort({ column: null, direction: 'asc' });
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  // Filter
  let filteredItems = items.filter(i => {
    if (search && !(i.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.category && i.category !== filters.category) return false;
    if (filters.type && (i.type || 'supply') !== filters.type) return false;
    if (selectedTags.length > 0) {
      const itemTags = parseTags(i.tags);
      if (!selectedTags.every(t => itemTags.includes(t))) return false;
    }
    return true;
  });

  
  // Sort
  if (sort.column) {
    filteredItems = [...filteredItems].sort((a, b) => {
      let av = a[sort.column] ?? '';
      let bv = b[sort.column] ?? '';
      if (sort.column === 'createdAt') {
        av = av?.seconds || 0;
        bv = bv?.seconds || 0;
      } else {
        const an = parseFloat(av), bn = parseFloat(bv);
        if (!isNaN(an) && !isNaN(bn)) { av = an; bv = bn; }
        else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      }
      if (av < bv) return sort.direction === 'asc' ? -1 : 1;
      if (av > bv) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }


  
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))].sort();
  const allTags = [...new Set(items.flatMap(i => parseTags(i.tags)))].sort();

  const SortableHeader = ({ column, label }) => (
    <th
      style={{ ...cellStyle, cursor: 'pointer', userSelect: 'none' }}
      onClick={() => toggleSort(column)}
    >
      {label}
      {sort.column === column && (sort.direction === 'asc' ? ' ▲' : ' ▼')}
    </th>
  );

  // Color-code type badges
  const typeBadge = (type) => {
    const t = type || 'supply';
    const colors = {
      supply: { bg: '#dbeafe', fg: '#1e40af' },
      instrument: { bg: '#fce7f3', fg: '#9d174d' },
      burs_polishers: { bg: '#fef3c7', fg: '#92400e' },
    };
    const c = colors[t] || { bg: '#eee', fg: '#333' };
    return (
      <span style={{
        fontSize: 10,
        padding: '1px 6px',
        background: c.bg,
        color: c.fg,
        borderRadius: 3,
        textTransform: 'uppercase',
      }}>{t === 'burs_polishers' ? 'Burs & Polishers' : t}</span>
    );
  };

  return (
    <section style={sectionStyle}>
      <h3>Inventory ({filteredItems.length}{filteredItems.length !== items.length && ` of ${items.length}`})</h3>

      <div style={{ marginBottom: 10 }}>
        <input type="file" accept=".csv" onChange={async (e) => {
          const file = e.target.files[0]; if (!file) return;
          try {
            const result = await importCSV(file);
            say(`CSV: ${result.added} new, ${result.updated} updated`);
            refresh();
          } catch (err) { say(`Import failed: ${err.message}`); }
        }} />
        <button onClick={async () => {
          await addItem({ name: `Test Item ${Date.now()}`, category: 'Misc', type: 'supply' });
          say('Added test item');
          refresh();
        }} style={{ marginLeft: 10 }}>+ Add Test Item</button>
        <button onClick={async () => {
          if (!confirm('Delete ALL inventory items?')) return;
          const n = await deleteAllItems();
          say(`Deleted ${n} items`);
          refresh();
        }} style={{ marginLeft: 10, color: 'red' }}>Delete All</button>
        
        <label style={{ marginLeft: 15, fontSize: 13 }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select value={filters.category} onChange={e => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.type} onChange={e => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}>
          <option value="">All types</option>
          <option value="supply">Supplies</option>
          <option value="instrument">Instruments</option>
          <option value="burs_polishers">Burs & Polishers</option>
        </select>
        {(search || filters.category || filters.type || selectedTags.length > 0) && (
          <button onClick={() => { setSearch(''); setFilters({ category: '', type: '' }); setSelectedTags([]); setPage(1); }}>Clear</button>
        )}
      </div>

      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: '#888', alignSelf: 'center' }}>Tags:</span>
          {allTags.map(tag => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  background: active ? '#333' : '#e0e0e0',
                  color: active ? 'white' : '#333',
                  border: '1px solid ' + (active ? '#333' : '#bbb'),
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12 }}>Sort by:</span>
        <select 
          value={`${sort.column}-${sort.direction}`} 
          onChange={e => {
            const [col, dir] = e.target.value.split('-');
            setSort({ column: col, direction: dir });
            setPage(1);
          }}
          style={{ padding: '2px 4px' }}
        >
          <option value="name-asc">Alphabetical (A-Z)</option>
          <option value="name-desc">Alphabetical (Z-A)</option>
          <option value="createdAt-asc">Date Added (Oldest)</option>
          <option value="createdAt-desc">Date Added (Latest)</option>
        </select>
      </div>

      <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4 }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#f4f4f4' }}>

          <tr style={{ background: '#f4f4f4', color: '#333', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <SortableHeader column="itemId" label="ID" />
            <SortableHeader column="name" label="Name" />
            <SortableHeader column="category" label="Category" />
            <SortableHeader column="type" label="Type" />
            <th style={cellStyle}>Tags</th>
            <th style={cellStyle}></th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map(i => editing === i.id ? (
            <tr key={i.id}>
              <td style={{ ...cellStyle, color: '#888', fontFamily: 'monospace' }}>{i.itemId || ''}</td>
              <td style={cellStyle}><input value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
              <td style={cellStyle}><input value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} /></td>
              <td style={cellStyle}>
                <select value={editForm.type || 'supply'} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                  <option value="supply">supply</option>
                  <option value="instrument">instrument</option>
                  <option value="burs_polishers">burs & polishers</option>
                </select>
              </td>
              <td style={cellStyle}>
                <input value={editForm.tags || ''} onChange={e => setEditForm({ ...editForm, tags: e.target.value })} placeholder="comma, separated" style={{ width: '100%' }} />
              </td>
              <td style={cellStyle}>
                <button onClick={saveEdit}>Save</button>
                <button onClick={() => setEditing(null)}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={i.id} style={i.archived ? { opacity: 0.5 } : {}}>
              <td style={{ ...cellStyle, color: '#888', fontFamily: 'monospace' }}>{i.itemId || ''}</td>
              <td style={cellStyle}><ItemName name={i.name || '(no name)'} /></td>
              <td style={cellStyle}>{i.category || ''}</td>
              <td style={cellStyle}>{typeBadge(i.type)}</td>
              <td style={cellStyle}>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {parseTags(i.tags).map(t => (
                    <span key={t} style={{ fontSize: 10, padding: '1px 6px', background: '#eee', borderRadius: 3, color: '#555' }}>{t}</span>
                  ))}
                </div>
              </td>
              <td style={cellStyle}>
                <button onClick={() => startEdit(i)}>Edit</button>
                {i.archived ? (
                  <button onClick={async () => { await restoreItem(i.id); say(`Restored: ${i.name}`); refresh(); }} style={{ color: 'green' }}>Restore</button>
                ) : (
                  <button onClick={() => remove(i)} style={{ color: 'red' }}>Archive</button>
                )}
              </td>
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr><td colSpan="6" style={{ ...cellStyle, textAlign: 'center', color: '#888' }}>No items match</td></tr>
          )}
        </tbody>
      </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 15 }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
        <span style={{ fontSize: 13 }}>Page {page} of {Math.max(1, totalPages)}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </section>
  );
}