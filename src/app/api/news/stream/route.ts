// API route for Server-Sent Events (SSE) news stream
// File: /api/news/stream/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Mock news data generator (replace with real news API integration)
function generateNewsUpdate() {
  const categories = ['technology', 'business', 'sports', 'entertainment', 'breaking'];
  const priorities = ['low', 'medium', 'high', 'breaking'];
  const authors = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  const author = authors[Math.floor(Math.random() * authors.length)];
  
  const article = {
    id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `Breaking: Important ${category} news update`,
    content: `This is a sample news article about ${category}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    summary: `Sample summary for ${category} news`,
    author,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category,
    tags: [category, 'news', 'update'],
    imageUrl: `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop`,
    sourceUrl: `https://example.com/news/${category}`,
    priority: priority as 'low' | 'medium' | 'high' | 'breaking',
    version: 1
  };
  
  return {
    type: Math.random() > 0.7 ? 'BREAKING_NEWS' : 'NEW_ARTICLE',
    article,
    timestamp: new Date().toISOString(),
    changeId: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
}

export async function GET(request: NextRequest) {
  // Set up Server-Sent Events headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      console.log('SSE stream started');
      
      // Send initial connection confirmation
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({
          type: 'CONNECTION_ESTABLISHED',
          message: 'Connected to news stream',
          timestamp: new Date().toISOString()
        })}\n\n`)
      );

      // Send periodic news updates
      const interval = setInterval(() => {
        try {
          const newsUpdate = generateNewsUpdate();
          const data = `data: ${JSON.stringify(newsUpdate)}\n\n`;
          controller.enqueue(encoder.encode(data));
          
          console.log('Sent news update:', newsUpdate.type, newsUpdate.article.title);
        } catch (error) {
          console.error('Error generating news update:', error);
        }
      }, 10000); // Send update every 10 seconds

      // Send heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const data = `data: ${JSON.stringify({
            type: 'HEARTBEAT',
            timestamp: new Date().toISOString()
          })}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('Heartbeat error:', error);
        }
      }, 30000); // Heartbeat every 30 seconds

      // Clean up on close
      const cleanup = () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        console.log('SSE stream cleanup');
      };

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        cleanup();
        controller.close();
      });

      // Store cleanup function for later use
      (controller as any).cleanup = cleanup;
    },
    
    cancel() {
      console.log('SSE stream cancelled');
      // Cleanup is handled in the abort event listener
    }
  });

  return new NextResponse(stream, { headers });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}