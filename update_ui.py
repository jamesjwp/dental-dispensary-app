with open('/Users/james/dispensary-app/src/components/InventorySection.jsx', 'r') as f:
    code = f.read()

# Default sort
code = code.replace("const [sort, setSort] = useState({ column: null, direction: 'asc' });",
                    "const [sort, setSort] = useState({ column: 'name', direction: 'asc' });\n  const [page, setPage] = useState(1);\n  const ITEMS_PER_PAGE = 50;")

# Search and filter resets
code = code.replace("onChange={e => setSearch(e.target.value)}",
                    "onChange={e => { setSearch(e.target.value); setPage(1); }}")

code = code.replace("onChange={e => setFilters({ ...filters, category: e.target.value })}",
                    "onChange={e => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}")

code = code.replace("onChange={e => setFilters({ ...filters, type: e.target.value })}",
                    "onChange={e => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}")

code = code.replace("prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]",
                    "prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]\n    );\n    setPage(1);")

code = code.replace("setSearch(''); setFilters({ category: '', type: '' }); setSelectedTags([]);",
                    "setSearch(''); setFilters({ category: '', type: '' }); setSelectedTags([]); setPage(1);")

# Sorting logic
sort_logic = """
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
"""
import re
code = re.sub(r'// Sort\n  if \(sort\.column\) \{[\s\S]*?\}\n', sort_logic, code)

# Pagination logic
pag_logic = """
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
"""
code = code.replace("const categories =", pag_logic + "\n  const categories =")

# Map over paginatedItems instead of filteredItems
code = code.replace("filteredItems.map(i => editing === i.id ?", "paginatedItems.map(i => editing === i.id ?")

# Add pagination controls and table wrapper
table_wrapper = """
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
"""
code = code.replace("<table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>\n        <thead>", table_wrapper)
# remove the original <tr background
code = code.replace("<tr style={{ background: '#f4f4f4', color: '#333' }}>", "<tr style={{ background: '#f4f4f4', color: '#333', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>")
code = code.replace("</table>", "</table>\n      </div>\n\n      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 15 }}>\n        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>\n        <span style={{ fontSize: 13 }}>Page {page} of {Math.max(1, totalPages)}</span>\n        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>\n      </div>")

with open('/Users/james/dispensary-app/src/components/InventorySection.jsx', 'w') as f:
    f.write(code)

print("Updated UI")
