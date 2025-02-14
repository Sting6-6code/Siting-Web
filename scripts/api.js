// Kimi API 配置
const KIMI_API_KEY = "your_actual_api_key_here"; // 将这里的值替换为您获取到的 API Key
const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";

const API_URL = 'http://localhost:3000/api/chat';

// 调用 Kimi API
async function callKimiAPI(userMessage) {
  try {
    console.log('Sending message:', userMessage);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "你是一个个人网站的AI助手，负责回答关于网站主人的问题。你会提供准确、友好的回答，并引导用户查看网站的相关部分。",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status} - ${data.message || '未知错误'}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('API返回格式错误');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("API 调用详细错误:", error);
    if (error.message.includes('API调用失败') || error.message.includes('API返回格式错误')) {
      return `抱歉，AI助手遇到了问题：${error.message}`;
    }
    return "抱歉，我现在无法回答您的问题。请检查网络连接或稍后再试。";
  }
} 