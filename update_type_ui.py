with open('/Users/james/dispensary-app/src/components/InventorySection.jsx', 'r') as f:
    inv = f.read()

inv = inv.replace("instrument: { bg: '#fce7f3', fg: '#9d174d' },", 
                  "instrument: { bg: '#fce7f3', fg: '#9d174d' },\n      burs_polishers: { bg: '#fef3c7', fg: '#92400e' },")

inv = inv.replace('<option value="instrument">Instruments</option>',
                  '<option value="instrument">Instruments</option>\n          <option value="burs_polishers">Burs & Polishers</option>')

inv = inv.replace('<option value="instrument">instrument</option>',
                  '<option value="instrument">instrument</option>\n                  <option value="burs_polishers">burs & polishers</option>')

with open('/Users/james/dispensary-app/src/components/InventorySection.jsx', 'w') as f:
    f.write(inv)

with open('/Users/james/dispensary-app/src/components/PresetDetailModal.jsx', 'r') as f:
    pre = f.read()

pre = pre.replace("const instruments = allItems.filter(i => i.type === 'instrument');",
                  "const instruments = allItems.filter(i => i.type === 'instrument');\n  const burs = allItems.filter(i => i.type === 'burs_polishers');")

pre = pre.replace("['supplies', 'instruments', 'cassettes'].map(t =>",
                  "['supplies', 'instruments', 'burs_polishers', 'cassettes'].map(t =>")

pre = pre.replace("{t.charAt(0).toUpperCase() + t.slice(1)}",
                  "{t === 'burs_polishers' ? 'Burs & Polishers' : t.charAt(0).toUpperCase() + t.slice(1)}")

add_burs_render = """
          {addTab === 'burs_polishers' && filterItems(burs).map(i => (
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
"""
pre = pre.replace("{addTab === 'cassettes' && filterCassettes().map(c => (",
                  add_burs_render + "\n          {addTab === 'cassettes' && filterCassettes().map(c => (")

with open('/Users/james/dispensary-app/src/components/PresetDetailModal.jsx', 'w') as f:
    f.write(pre)

print("Updated UI files")
