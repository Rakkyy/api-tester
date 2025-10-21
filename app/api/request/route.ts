import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, method, headers, body } = await request.json();

    const startTime = Date.now();

    // Build headers object
    const fetchHeaders: Record<string, string> = {};
    if (headers && Array.isArray(headers)) {
      headers.forEach((header: { key: string; value: string; enabled: boolean }) => {
        if (header.enabled && header.key && header.value) {
          // Skip Content-Type and Content-Length for GET/HEAD requests
          if ((method === 'GET' || method === 'HEAD') &&
              (header.key.toLowerCase() === 'content-type' ||
               header.key.toLowerCase() === 'content-length')) {
            return;
          }
          fetchHeaders[header.key] = header.value;
        }
      });
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: fetchHeaders,
    };

    // Only add body for non-GET requests
    if (method !== 'GET' && method !== 'HEAD' && body) {
      fetchOptions.body = body;
    }

    // Make the request
    const response = await fetch(url, fetchOptions);

    const duration = Date.now() - startTime;

    // Get response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Get response body
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
      duration,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { error: error.message || 'Failed to make request' },
        duration: 0,
      },
      { status: 500 }
    );
  }
}
