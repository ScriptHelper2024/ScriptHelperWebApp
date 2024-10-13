import React, { useEffect, useState, useCallback} from 'react';
import useApi from '../../../api/useApi';
import usePageTitle from '../../../hooks/usePageTitle';
import PageContextMenu from '../../../components/PageContextMenu/PageContextMenu';
import PlatformSettingsForm from '../../../components/PlatformSettingsForm/PlatformSettingsForm';

const PlatformSettings = () => {
  usePageTitle('Platform Settings');
  const api = useApi();
  const [settings, setSettings] = useState([]);
  const [promptTemplates, setPromptTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Using useCallback to memoize this function to ensure it doesn't cause useEffect to re-run
  const fetchTemplates = useCallback(async (page = 0, allTemplates = []) => {
    try {
      const { records, pages } = await api.searchPromptTemplates(page, '');
      const newAllTemplates = [...allTemplates, ...records];
      if (page < pages - 1) {
        await fetchTemplates(page + 1, newAllTemplates);
      } else {
        setPromptTemplates(newAllTemplates);
      }
    } catch (e) {
      console.error('Error fetching prompt templates:', e);
    }
  }, []); // Empty dependency array ensures this is created once

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.platformSettings();
        setSettings(response.data.listPlatformSettings);
        await fetchTemplates(); // Call without arguments to start from the first page
      } catch (err) {
        setError(err.message || 'An error occurred fetching settings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchTemplates]); // Adding fetchTemplates as a dependency since it's now memoized


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="PlatformSettings p-4 space-y-4">
      <PageContextMenu title="Platform Settings" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {settings.map(setting => (
          <PlatformSettingsForm key={setting.id} setting={setting} promptTemplates={promptTemplates} />
        ))}
      </div>
    </div>
  );
};


export default PlatformSettings;
