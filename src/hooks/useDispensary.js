import { useState, useEffect, useRef } from 'react';
import { getAllItems } from '../services/inventoryService';
import { getAllCassettes } from '../services/cassetteService';
import { getGroups, getPresets } from '../services/presetService';
import { seedProceduralSetupLists } from '../services/seedService';

const GENERAL_GROUP_NAME = 'General Setup Lists';

export function useDispensary() {
  const [items, setItems] = useState([]);
  const [cassettes, setCassettes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [presetsByGroup, setPresetsByGroup] = useState({});
  const [log, setLog] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const seeded = useRef(false);

  const say = (msg) =>
    setLog(l => [`${new Date().toLocaleTimeString()}: ${msg}`, ...l].slice(0, 20));

  const refresh = async () => {
    try {
      setItems(await getAllItems({ includeArchived: showArchived }));
      setCassettes(await getAllCassettes());
      const g = await getGroups();
      setGroups(g);
      const byGroup = {};
      for (const grp of g) byGroup[grp.id] = await getPresets(grp.id);
      setPresetsByGroup(byGroup);

      // Auto-seed setup lists on first load if none exist
      if (!seeded.current) {
        seeded.current = true;
        const generalGroup = g.find(grp => grp.name === GENERAL_GROUP_NAME);
        const hasPresets = generalGroup && (byGroup[generalGroup.id] || []).length > 0;
        if (!hasPresets) {
          say('Seeding default setup lists...');
          const result = await seedProceduralSetupLists();
          say(`Setup lists: ${result.created} created, ${result.skipped} skipped`);
          // Re-fetch to pick up the new data
          const g2 = await getGroups();
          setGroups(g2);
          const byGroup2 = {};
          for (const grp of g2) byGroup2[grp.id] = await getPresets(grp.id);
          setPresetsByGroup(byGroup2);
        }
      }
    } catch (e) {
      say(`Error: ${e.message}`);
    }
  };

  useEffect(() => { refresh(); }, [showArchived]);

  return { items, cassettes, groups, presetsByGroup, log, say, refresh, showArchived, setShowArchived };
}