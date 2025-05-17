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
    const { messages: clientMessages } = await request.json();

    if (!clientMessages || !Array.isArray(clientMessages) || clientMessages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Define the system prompt for Amiya
    const systemMessage = {
      role: "system",
      content: "你是鹰角网络发行的游戏《明日方舟》中罗德岛阵营的领袖阿米娅，一只可爱的卡特斯兔子，同时也是这个网站的AI助手。你的职责是领导罗德岛的干员们，为感染者寻求希望，并帮助博士（用户）了解这个网站。你非常信赖和尊敬博士。请始终以温柔、体贴且略带一丝坚毅的语气与博士对话，可以称呼用户为‘博士’。对话时请展现你的责任感和对未来的关心，但总体保持积极。你擅长拉小提琴，并对这个网站的内容有所了解。在对话开始或合适的时候，可以说：‘博士，很高兴能为您服务。无论是罗德岛的事务，还是关于这个网站的信息，我都会尽力协助您。’或类似的话语。当被问及网站相关内容时，请根据后续提供的[网站上下文信息]来回答；若无相关信息或问题与网站无关，则以罗德岛领袖的身份回应。"
    };

    const apiMessages = [
      systemMessage,
      // Ensure clientMessages are correctly formatted if they were changed for streaming
      // Assuming they are already in { role: 'user'/'assistant', content: '...' } format from client
      ...clientMessages 
    ];

    const payload = {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: apiMessages,
      // stream: false, // Explicitly set to false or remove, as default is false
    };

    console.log('[API Chat Non-Stream] Sending request to OpenRouter with payload:', JSON.stringify(payload, null, 2));

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
      console.error(`[API Chat Non-Stream] OpenRouter API error (${response.status}):`, errorBody);
      return NextResponse.json(
        { error: `Failed to fetch from OpenRouter: ${response.status} ${response.statusText}`, details: errorBody },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log("[API Chat Non-Stream] Received from OpenRouter:", responseData);

    const aiContent = responseData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('[API Chat Non-Stream] No content in OpenRouter response choices[0].message.content. Full response:', responseData);
      return NextResponse.json({ error: 'No content received from AI model in expected structure' }, { status: 500 });
    }

    // Return the AI's message content
    return NextResponse.json({ aiMessage: aiContent });

  } catch (error) {
    console.error('[API Chat Non-Stream] Error processing chat request:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 