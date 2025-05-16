import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

class ChatAI {
  private openai: OpenAI
  private systemMessage: ChatCompletionMessageParam = {
    role: 'system',
    content: `你是一个专业的AI助手，具有以下特点：
      1. 回答准确、专业、有深度
      2. 语言简洁明了，避免冗长的解释
      3. 如果遇到不确定的问题，会诚实地表示不知道
      4. 会主动提供相关的补充信息
      5. 使用中文回答，除非用户特别要求使用其他语言
      6. 保持友好和专业的语气
      7. 在回答技术问题时，会提供具体的代码示例
      8. 会考虑用户可能的后续问题，提前给出建议`
  };

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: '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',
      dangerouslyAllowBrowser: true
    });
  }

  async chat(messages: ChatCompletionMessageParam[], onMessage: (content: string) => void) {
    try {
      const stream = await this.openai.chat.completions.create({
        model: 'mistralai/mistral-7b-instruct',
        messages: [this.systemMessage, ...messages],
        stream: true,
      });

      let fullContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onMessage(content);
        }
      }
      return fullContent;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
}

export default ChatAI;