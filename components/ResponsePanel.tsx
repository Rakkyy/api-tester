'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { vs2015, github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ApiResponse } from '@/types';

SyntaxHighlighter.registerLanguage('json', json);

interface ResponsePanelProps {
  response: ApiResponse | null;
  isLoading: boolean;
}

export default function ResponsePanel({ response, isLoading }: ResponsePanelProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Send a request to see the response</div>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 300 && status < 400) return 'text-yellow-400';
    if (status >= 400) return 'text-red-400';
    return 'text-gray-400';
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status Bar */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-[#252526] border-b border-gray-300 dark:border-[#3e3e42] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Status:</span>
          <span className={`font-semibold text-sm sm:text-base ${getStatusColor(response.status)}`}>
            {response.status} {response.statusText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Time:</span>
          <span className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">{response.duration}ms</span>
        </div>
      </div>

      {/* Response Body */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Response Body</h3>
            <button
              onClick={() => {
                const newCollapsed = new Set(collapsed);
                if (collapsed.has('body')) {
                  newCollapsed.delete('body');
                } else {
                  newCollapsed.add('body');
                }
                setCollapsed(newCollapsed);
              }}
              className="text-xs text-blue-600 dark:text-[#007acc] hover:underline"
            >
              {collapsed.has('body') ? 'Expand' : 'Collapse'}
            </button>
          </div>
          {!collapsed.has('body') && (
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded overflow-hidden overflow-x-auto">
              <SyntaxHighlighter
                language="json"
                style={theme === 'dark' ? vs2015 : github}
                customStyle={{
                  margin: 0,
                  padding: '0.75rem',
                  background: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
                  fontSize: '0.75rem',
                }}
                wrapLongLines={true}
              >
                {formatJson(response.data)}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

        {/* Response Headers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Response Headers</h3>
            <button
              onClick={() => {
                const newCollapsed = new Set(collapsed);
                if (collapsed.has('headers')) {
                  newCollapsed.delete('headers');
                } else {
                  newCollapsed.add('headers');
                }
                setCollapsed(newCollapsed);
              }}
              className="text-xs text-blue-600 dark:text-[#007acc] hover:underline"
            >
              {collapsed.has('headers') ? 'Expand' : 'Collapse'}
            </button>
          </div>
          {!collapsed.has('headers') && (
            <div className="bg-gray-50 dark:bg-[#2d2d30] rounded p-3 sm:p-4 space-y-2 overflow-x-auto">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-xs sm:text-sm">
                  <span className="text-blue-600 dark:text-[#9cdcfe] font-mono whitespace-nowrap">{key}:</span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono break-all">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
