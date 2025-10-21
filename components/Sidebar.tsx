'use client';

import { ApiRequest } from '@/types';

interface SidebarProps {
  requests: ApiRequest[];
  onSelectRequest: (request: ApiRequest) => void;
  onDeleteRequest: (id: string) => void;
  selectedRequestId: string | null;
}

export default function Sidebar({ requests, onSelectRequest, onDeleteRequest, selectedRequestId }: SidebarProps) {
  return (
    <div className="w-64 sm:w-72 lg:w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col h-full">
      <div className="px-3 sm:px-4 py-3 border-b border-[#3e3e42]">
        <h2 className="text-sm font-semibold text-gray-300">Saved Requests</h2>
        <p className="text-xs text-gray-500 mt-1">{requests.length} request{requests.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs sm:text-sm">
            No saved requests yet
          </div>
        ) : (
          <div className="py-2">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`group px-3 sm:px-4 py-2 hover:bg-[#2d2d30] cursor-pointer transition-colors ${
                  selectedRequestId === request.id ? 'bg-[#2d2d30]' : ''
                }`}
                onClick={() => onSelectRequest(request)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          request.method === 'GET'
                            ? 'bg-green-900 text-green-300'
                            : request.method === 'POST'
                            ? 'bg-yellow-900 text-yellow-300'
                            : request.method === 'PUT'
                            ? 'bg-blue-900 text-blue-300'
                            : request.method === 'DELETE'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-purple-900 text-purple-300'
                        }`}
                      >
                        {request.method}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1 truncate">{request.name}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{request.url}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRequest(request.id);
                    }}
                    className="opacity-0 sm:group-hover:opacity-100 lg:opacity-100 text-red-400 hover:text-red-300 text-sm sm:text-xs transition-opacity flex-shrink-0"
                    aria-label="Delete request"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
