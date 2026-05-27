import { useState, useEffect } from 'react';
import { getAllItems } from '../services/inventoryService';
import { getAllCassettes } from '../services/cassetteService';
import { getGroups, getPresets } from '../services/presetService';

export function useDispensary() {
  const [items, setItems] = useState([]);
  const [cassettes, setCassettes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [presetsByGroup, setPresetsByGroup] = useState({});
  const [log, setLog] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

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
    } catch (e) {
      say(`Error: ${e.message}`);
    }
  };

  useEffect(() => { refresh(); }, [showArchived]);

  return { items, cassettes, groups, presetsByGroup, log, say, refresh, showArchived, setShowArchived };
}