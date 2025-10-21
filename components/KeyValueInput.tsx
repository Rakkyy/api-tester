'use client';

import { KeyValuePair } from '@/types';

interface KeyValueInputProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  placeholder?: { key: string; value: string };
}

export default function KeyValueInput({ items, onChange, placeholder }: KeyValueInputProps) {
  const handleAdd = () => {
    onChange([...items, { key: '', value: '', enabled: true }]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof KeyValuePair, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex gap-2 items-center flex-1">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => handleChange(index, 'enabled', e.target.checked)}
              className="w-4 h-4 flex-shrink-0"
            />
            <input
              type="text"
              placeholder={placeholder?.key || 'Key'}
              value={item.key}
              onChange={(e) => handleChange(index, 'key', e.target.value)}
              className="flex-1 min-w-0 px-2 sm:px-3 py-2 bg-white dark:bg-[#2d2d30] border border-gray-300 dark:border-[#3e3e42] rounded text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-[#007acc]"
            />
            <input
              type="text"
              placeholder={placeholder?.value || 'Value'}
              value={item.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              className="flex-1 min-w-0 px-2 sm:px-3 py-2 bg-white dark:bg-[#2d2d30] border border-gray-300 dark:border-[#3e3e42] rounded text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-[#007acc]"
            />
          </div>
          <button
            onClick={() => handleRemove(index)}
            className="w-full sm:w-auto px-3 py-2 bg-red-600 dark:bg-[#c72e2e] hover:bg-red-700 dark:hover:bg-[#e03838] rounded text-xs sm:text-sm text-white transition-colors"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-[#0e639c] hover:bg-blue-700 dark:hover:bg-[#1177bb] rounded text-xs sm:text-sm text-white transition-colors"
      >
        Add {placeholder?.key || 'Item'}
      </button>
    </div>
  );
}
