import { useState, useEffect, useRef } from 'react';
import { getAllItems } from '../services/inventoryService';
import { getAllCassettes } from '../services/cassetteService';
import { getGroups, getPresets } from '../services/presetService';
import { getActiveProfile } from '../services/authService';

const GENERAL_GROUP_NAME = 'General Setup Lists';

export function useDispensary() {
  const cacheKey = `dispensaryCache_${getActiveProfile() || 'none'}`;
  const cached = (() => {
    try { return JSON.parse(localStorage.getItem(cacheKey)) || {}; }
    catch { return {}; }
  })();
  const [items, setItems] = useState(cached.items || []);
  const [cassettes, setCassettes] = useState(cached.cassettes || []);
  const [groups, setGroups] = useState(cached.groups || []);
  const [presetsByGroup, setPresetsByGroup] = useState(cached.presetsByGroup || {});
  const [log, setLog] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const seeded = useRef(false);

  const say = (msg) =>
    setLog(l => [`${new Date().toLocaleTimeString()}: ${msg}`, ...l].slice(0, 20));

  const refresh = async () => {
    try {
      // Auto-seed everything on first load
      if (!seeded.current) {
        seeded.current = true;
        const { seedDrawerSupplies, seedVitals, seedBursAndPolishers, seedCassettes, seedProceduralSetupLists, seedXrayEquipment, seedEndoFiles } = await import('../services/seedService');

        const existingItems = await getAllItems({ includeArchived: true });
        if (existingItems.length === 0) {
          say('Seeding inventory...');
        }

        // Always run idempotent ops — safe to repeat, only act when needed
        await seedDrawerSupplies();
        await seedVitals();
        await seedBursAndPolishers();
        await seedXrayEquipment();
        await seedEndoFiles();

        const existingCassettes = await getAllCassettes();
        if (existingCassettes.length === 0) {
          say('Seeding cassettes...');
          await seedCassettes();
        }

        const g0 = await getGroups();
        const generalGroup0 = g0.find(grp => grp.name === GENERAL_GROUP_NAME);
        let hasPresets = false;
        if (generalGroup0) hasPresets = (await getPresets(generalGroup0.id)).length > 0;
        const lockKey = `seedLock_${getActiveProfile() || 'none'}`;
        const lock = parseInt(localStorage.getItem(lockKey) || '0', 10);
        const lockFresh = Date.now() - lock < 30000;
        if (!hasPresets && !lockFresh) {
          localStorage.setItem(lockKey, String(Date.now()));
          say('Seeding setup lists...');
          await seedProceduralSetupLists();
          localStorage.removeItem(lockKey);
        }
      }

      const freshItems = await getAllItems({ includeArchived: showArchived });
      const freshCassettes = await getAllCassettes();
      const g = await getGroups();
      const byGroup = {};
      for (const grp of g) byGroup[grp.id] = await getPresets(grp.id);

      setItems(freshItems);
      setCassettes(freshCassettes);
      setGroups(g);
      setPresetsByGroup(byGroup);

      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          items: freshItems, cassettes: freshCassettes, groups: g, presetsByGroup: byGroup,
        }));
      } catch { /* cache write failed, ignore */ }
    } catch (e) {
      say(`Error: ${e.message}`);
    }
  };

  useEffect(() => { refresh(); }, [showArchived]);

  return { items, cassettes, groups, presetsByGroup, log, say, refresh, showArchived, setShowArchived };
}