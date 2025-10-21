import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let { url, method, headers, body } = await request.json();

    // Validate and fix URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          status: 0,
          statusText: 'Error',
          headers: {},
          data: { error: 'URL is required' },
          duration: 0,
        },
        { status: 400 }
      );
    }

    // Add protocol if missing
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        {
          status: 0,
          statusText: 'Error',
          headers: {},
          data: { error: 'Invalid URL format. Please enter a valid URL (e.g., https://api.example.com)' },
          duration: 0,
        },
        { status: 400 }
      );
    }

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
    console.error('API request error:', error);

    // Provide more specific error messages
    let errorMessage = error.message || 'Failed to make request';

    if (error.cause?.code === 'ENOTFOUND') {
      errorMessage = 'Could not resolve hostname. Please check the URL and try again.';
    } else if (error.cause?.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. The server may be down or unreachable.';
    } else if (error.name === 'AbortError') {
      errorMessage = 'Request timeout. The server took too long to respond.';
    }

    return NextResponse.json(
      {
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { error: errorMessage },
        duration: 0,
      },
      { status: 500 }
    );
  }
}
