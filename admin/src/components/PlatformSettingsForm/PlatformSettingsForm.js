import React, { useEffect, useState } from 'react';
import useApi from '../../api/useApi';

const PlatformSettingsForm = ({ setting, promptTemplates, onUpdate }) => {
  const api = useApi();
  const [value, setValue] = useState(() => setting.value || '');
  const [systemRole, setSystemRole] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  useEffect(() => {
    const initialValues = setting.value ? JSON.parse(setting.value) : {};
    setSystemRole(initialValues.system_role || '');
    setUserPrompt(initialValues.user_prompt || '');
  }, [setting.value]);

  const handleValueChange = (e) => {
    setValue(e.target.value);
    onUpdate(setting.key, e.target.value);
  };

  // Updated to correctly handle the selection from dropdown
  const handleSelectChange = (e) => {
    const { name, value } = e.target;

    if(name === 'systemRole') {
      setSystemRole(value);
    } else if(name === 'userPrompt') {
      setUserPrompt(value);
    }

    // Trigger an update to potentially save the changes
    const updatedValue = JSON.stringify({
      system_role: name === 'systemRole' ? value : systemRole,
      user_prompt: name === 'userPrompt' ? value : userPrompt,
    });

    try {
      api.updatePlatformSetting({ key: setting.key, value: updatedValue });
      console.log('Update successful');
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-5">
      <div className="mb-4">
        <label className="block font-bold text-lg mb-2">
          Setting Key: <span className="font-normal">{setting.key}</span>
        </label>
        {!setting.key.startsWith('prompts.') ? (
          <input
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            type="text"
            value={value}
            onChange={handleValueChange}
          />
        ) : (
          <>
            <label className="block">
              System Role
              <select
                name="systemRole"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={systemRole}
                onChange={handleSelectChange} // Updated to handleSelectChange
              >
                <option value="">[None]</option>
                {promptTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              User Prompt
              <select
                name="userPrompt"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={userPrompt}
                onChange={handleSelectChange} // Updated to handleSelectChange
              >
                <option value="">[None]</option>
                {promptTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default PlatformSettingsForm;
