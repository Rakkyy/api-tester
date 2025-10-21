'use client';

import { useState, useEffect } from 'react';
import { ApiRequest, ApiResponse, HttpMethod, KeyValuePair } from '@/types';
import KeyValueInput from '@/components/KeyValueInput';
import ResponsePanel from '@/components/ResponsePanel';
import Sidebar from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

const STORAGE_KEY = 'api-tester-requests';
const MAX_REQUESTS = 20;

export default function Home() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<KeyValuePair[]>([{ key: 'Content-Type', value: 'application/json', enabled: true }]);
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>([]);
  const [body, setBody] = useState('{\n  \n}');
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'params'>('headers');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedRequests, setSavedRequests] = useState<ApiRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestName, setRequestName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clear body when switching to GET method
  useEffect(() => {
    if (method === 'GET') {
      setBody('');
    } else if (body === '') {
      setBody('{\n  \n}');
    }
  }, [method]);

  // Load saved requests from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSavedRequests(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved requests:', error);
      }
    }
  }, []);

  // Save requests to localStorage
  const saveRequest = (request: ApiRequest) => {
    const updated = [request, ...savedRequests.filter((r) => r.id !== request.id)].slice(0, MAX_REQUESTS);
    setSavedRequests(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteRequest = (id: string) => {
    const updated = savedRequests.filter((r) => r.id !== id);
    setSavedRequests(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (selectedRequestId === id) {
      setSelectedRequestId(null);
    }
  };

  const loadRequest = (request: ApiRequest) => {
    setUrl(request.url);
    setMethod(request.method);
    setHeaders(request.headers);
    setQueryParams(request.queryParams);
    setBody(request.body);
    setRequestName(request.name);
    setSelectedRequestId(request.id);
  };

  const buildUrl = () => {
    const enabledParams = queryParams.filter((p) => p.enabled && p.key);
    if (enabledParams.length === 0) return url;

    const separator = url.includes('?') ? '&' : '?';
    const query = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
    return `${url}${separator}${query}`;
  };

  const sendRequest = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    // Validate JSON body if method is not GET
    if (method !== 'GET' && body.trim()) {
      try {
        JSON.parse(body);
      } catch (error: any) {
        alert(`Invalid JSON in request body:\n${error.message}\n\nTip: Use double quotes (") for strings, not single quotes (')`);
        return;
      }
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const fullUrl = buildUrl();

      // Prepare request payload
      const payload: any = {
        url: fullUrl,
        method,
        headers,
      };

      // Only include body for methods that support it
      if (method !== 'GET' && body.trim()) {
        payload.body = body;
      }

      const res = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data);

      // Auto-save request
      const name = requestName || `${method} ${new URL(fullUrl).pathname}`;
      const newRequest: ApiRequest = {
        id: selectedRequestId || `${Date.now()}-${Math.random()}`,
        name,
        url,
        method,
        headers,
        queryParams,
        body,
        timestamp: Date.now(),
      };
      saveRequest(newRequest);
      setSelectedRequestId(newRequest.id);
    } catch (error: any) {
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { error: error.message },
        duration: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          requests={savedRequests}
          onSelectRequest={(req) => {
            loadRequest(req);
            setIsSidebarOpen(false);
          }}
          onDeleteRequest={deleteRequest}
          selectedRequestId={selectedRequestId}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-100 dark:bg-[#252526] border-b border-gray-300 dark:border-[#3e3e42]">
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-3">
              {/* Hamburger Menu for Mobile */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-[#2d2d30] rounded transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-200">API Tester</h1>
            </div>
            <ThemeToggle />
          </div>

          {/* Request Name */}
          <input
            type="text"
            placeholder="Request name (optional)"
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
            className="w-full px-3 py-2 mb-3 bg-white dark:bg-[#2d2d30] border border-gray-300 dark:border-[#3e3e42] rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-[#007acc]"
          />

          {/* URL Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-[#2d2d30] border border-gray-300 dark:border-[#3e3e42] rounded font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-[#007acc]"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input
              type="text"
              placeholder="Enter request URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
              className="flex-1 px-3 sm:px-4 py-2 bg-white dark:bg-[#2d2d30] border border-gray-300 dark:border-[#3e3e42] rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-[#007acc]"
            />
            <button
              onClick={sendRequest}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 dark:bg-[#0e639c] hover:bg-blue-700 dark:hover:bg-[#1177bb] disabled:bg-blue-400 dark:disabled:bg-[#0e639c]/50 rounded font-semibold transition-colors text-white"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Request Panel */}
          <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-300 dark:border-[#3e3e42] flex flex-col min-h-[300px] lg:min-h-0">
            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-[#252526] border-b border-gray-300 dark:border-[#3e3e42] overflow-x-auto">
              <button
                onClick={() => setActiveTab('params')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'params'
                    ? 'text-gray-900 dark:text-white border-b-2 border-blue-600 dark:border-[#007acc]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                Query Params
              </button>
              <button
                onClick={() => setActiveTab('headers')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'headers'
                    ? 'text-gray-900 dark:text-white border-b-2 border-blue-600 dark:border-[#007acc]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                Headers
              </button>
              <button
                onClick={() => setActiveTab('body')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'body'
                    ? 'text-gray-900 dark:text-white border-b-2 border-blue-600 dark:border-[#007acc]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                Body
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {activeTab === 'params' && (
                <KeyValueInput
                  items={queryParams}
                  onChange={setQueryParams}
                  placeholder={{ key: 'Parameter', value: 'Value' }}
                />
              )}
              {activeTab === 'headers' && (
                <KeyValueInput
                  items={headers}
                  onChange={setHeaders}
                  placeholder={{ key: 'Header', value: 'Value' }}
                />
              )}
              {activeTab === 'body' && (
                <div className="flex flex-col h-full gap-2">
                  {method === 'GET' && (
                    <div className="px-4 py-3 bg-blue-50 dark:bg-[#3e3e42] border border-blue-400 dark:border-[#007acc] rounded text-sm text-blue-900 dark:text-gray-300">
                      ℹ️ GET requests cannot have a body. Body will not be sent with this request.
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        try {
                          const formatted = JSON.stringify(JSON.parse(body), null, 2);
                          setBody(formatted);
                        } catch (error: any) {
                          alert(`Cannot format: ${error.message}`);
                        }
                      }}
                      disabled={method === 'GET'}
                      className="px-3 py-1.5 bg-blue-600 dark:bg-[#0e639c] hover:bg-blue-700 dark:hover:bg-[#1177bb] disabled:bg-gray-300 dark:disabled:bg-[#3e3e42] disabled:cursor-not-allowed rounded text-xs text-white transition-colors"
                    >
                      Format JSON
                    </button>
                    <button
                      onClick={() => setBody('{\n  \n}')}
                      disabled={method === 'GET'}
                      className="px-3 py-1.5 bg-gray-300 dark:bg-[#3e3e42] hover:bg-gray-400 dark:hover:bg-[#4e4e52] disabled:bg-gray-200 dark:disabled:bg-[#3e3e42] disabled:cursor-not-allowed rounded text-xs text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={method === 'GET' ? 'Body not allowed for GET requests' : '{"key": "value"}'}
                    className="flex-1 w-full min-h-[200px] sm:min-h-[300px] px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-[#2d2d30] border border-gray-300 dark:border-[#3e3e42] rounded font-mono text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-[#007acc] resize-none"
                    disabled={method === 'GET'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Response Panel */}
          <div className="w-full lg:w-1/2 min-h-[300px] lg:min-h-0">
            <ResponsePanel response={response} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
