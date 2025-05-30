import { NextResponse } from 'next/server';

// IMPORTANT: Set your OpenRouter API Key in your environment variables.
// For local development, you can create a .env.local file in the root of your project:
// OPENROUTER_API_KEY=your_openrouter_api_key_here
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: Request) {
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not configured');
    return NextResponse.json(
      { error: 'API key not configured. Please set OPENROUTER_API_KEY.' },
      { status: 500 }
    );
  }

  try {
    const { messages: clientMessages, systemPrompt } = await request.json();

    if (!clientMessages || !Array.isArray(clientMessages) || clientMessages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const systemMessageContent = systemPrompt || "You are a helpful AI assistant.";
    const systemMessage = {
      role: "system",
      content: systemMessageContent
    };

    const apiMessages = [
      systemMessage,
      ...clientMessages 
    ];

    const payload = {
      model: 'deepseek/deepseek-r1-0528:free',
      messages: apiMessages,
    };

    console.log('[API Chat] Sending request to OpenRouter with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[API Chat] OpenRouter API error (${response.status}):`, errorBody);
      return NextResponse.json(
        { error: `Failed to fetch from OpenRouter: ${response.status} ${response.statusText}`, details: errorBody },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log("[API Chat] Received from OpenRouter:", responseData);

    const aiContent = responseData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('[API Chat] No content in OpenRouter response choices[0].message.content. Full response:', responseData);
      return NextResponse.json({ error: 'No content received from AI model in expected structure' }, { status: 500 });
    }

    return NextResponse.json({ aiMessage: aiContent });

  } catch (error) {
    console.error('[API Chat] Error processing chat request:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 