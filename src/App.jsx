import { useState } from 'react';
import { getActiveProfile, logout } from './services/authService';
import AuthScreen from './components/AuthScreen';
import InventorySection from './components/InventorySection';
import CassettesSection from './components/CassettesSection';
import GroupsSection from './components/GroupsSection';
import PresetDetailModal from './components/PresetDetailModal';
import { useDispensary } from './hooks/useDispensary';

function MainScreen({ profile, onLogout }) {
  const { items, cassettes, groups, presetsByGroup, log, say, refresh, showArchived, setShowArchived } = useDispensary();
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [tab, setTab] = useState('inventory');

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 1100, margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Profile: {profile}</h2>
        <button onClick={() => { logout(); onLogout(); }}>Logout</button>
      </header>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #ddd', marginTop: 15 }}>
        {['inventory', 'setupLists'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 0,
              background: tab === t ? '#fff' : '#f4f4f4',
              borderBottom: tab === t ? '3px solid #3b82f6' : '3px solid transparent',
              fontWeight: tab === t ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            {t === 'inventory' ? 'Inventory' : 'Setup Lists'}
          </button>
        ))}
      </div>

      {tab === 'inventory' && (
        <>
          <InventorySection items={items} say={say} refresh={refresh} showArchived={showArchived} setShowArchived={setShowArchived} />
          <CassettesSection cassettes={cassettes} items={items} say={say} refresh={refresh} />
        </>
      )}

      {tab === 'setupLists' && (
        <GroupsSection
          groups={groups}
          presetsByGroup={presetsByGroup}
          items={items}
          cassettes={cassettes}
          say={say}
          refresh={refresh}
          onOpenPreset={setSelectedPreset}
        />
      )}

      {selectedPreset && (
        <PresetDetailModal
          preset={selectedPreset}
          allItems={items}
          cassettes={cassettes}
          presetsByGroup={presetsByGroup}
          say={say}
          refresh={refresh}
          onClose={() => setSelectedPreset(null)}
        />
      )}

      <section style={{ border: '1px solid #ddd', padding: 15, marginTop: 15, borderRadius: 4 }}>
        <h3>Activity Log</h3>
        <pre style={{ background: '#f4f4f4', color: '#333', padding: 10, fontSize: 11, maxHeight: 150, overflow: 'auto' }}>
          {log.join('\n') || '(no activity yet)'}
        </pre>
      </section>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(getActiveProfile());
  if (!profile) return <AuthScreen onAuth={setProfile} />;
  return <MainScreen profile={profile} onLogout={() => setProfile(null)} />;
}