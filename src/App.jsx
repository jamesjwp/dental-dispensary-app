import { useState } from 'react';
import { getActiveProfile, logout } from './services/authService';
import AuthScreen from './components/AuthScreen';
import InventorySection from './components/InventorySection';
import CassettesSection from './components/CassettesSection';
import GeneralSetupLists from './components/GeneralSetupLists';

import PresetDetailModal from './components/PresetDetailModal';
import { useDispensary } from './hooks/useDispensary';
import './App.css';

function MainScreen({ profile, onLogout }) {
  const { items, cassettes, groups, presetsByGroup, log, say, refresh, showArchived, setShowArchived } = useDispensary();
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [tab, setTab] = useState('setupLists');

  return (
    <div>
      <header className="app-header">
        <div>
          <h1>Dental Supplies Database</h1>
          <p className="subtitle">Professional Procedural Armamentarium & Inventory Manager</p>
        </div>
        <div className="profile-info">
          <span>Profile: {profile}</span>
          <button onClick={() => { logout(); onLogout(); }}>Logout</button>
        </div>
      </header>

      <nav className="tab-bar">
        {[
          { id: 'setupLists', label: 'Setup Lists' },
          { id: 'supplies', label: 'Supplies' },
          { id: 'cassettes', label: 'Cassettes' },
        ].map(t => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="page-content">
        {tab === 'setupLists' && (
          <GeneralSetupLists
            groups={groups}
            presetsByGroup={presetsByGroup}
            items={items}
            cassettes={cassettes}
            say={say}
            refresh={refresh}
            onOpenPreset={setSelectedPreset}
          />
        )}


        {tab === 'supplies' && (
          <InventorySection items={items} say={say} refresh={refresh} showArchived={showArchived} setShowArchived={setShowArchived} />
        )}

        {tab === 'cassettes' && (
          <CassettesSection cassettes={cassettes} items={items} say={say} refresh={refresh} />
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

        <section style={{ marginTop: 40, padding: 15, background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 14, color: '#6b7280', textTransform: 'uppercase' }}>Activity Log</h3>
          <pre style={{ background: '#f9fafb', color: '#333', padding: 10, fontSize: 11, maxHeight: 120, overflow: 'auto', margin: 0 }}>
            {log.join('\n') || '(no activity yet)'}
          </pre>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(getActiveProfile());
  if (!profile) return <AuthScreen onAuth={setProfile} />;
  return <MainScreen profile={profile} onLogout={() => setProfile(null)} />;
}