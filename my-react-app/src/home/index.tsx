import { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Container,
  Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatAI from './chat';
import './index.css'
import { ChatCompletionMessageParam } from 'openai/resources/chat';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

export default () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatAI = useRef(new ChatAI());

  const handleSend = async () => {
    if (inputText.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now(),
        text: inputText,
        isUser: true
      };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);

      // 创建AI消息占位
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: '',
        isUser: false
      };
      setMessages(prev => [...prev, aiMessage]);

      try {
        const chatMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        })).concat({
          role: 'user',
          content: inputText
        }) as ChatCompletionMessageParam[];

        await chatAI.current.chat(chatMessages, (content) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (!lastMessage.isUser) {
              lastMessage.text += content;
            }
            return newMessages;
          });
        });
      } catch (error) {
        console.error('Chat error:', error);
        // 处理错误，可以添加一个错误消息
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          mb: 2,
          p: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
            '&:hover': {
              background: '#fff',
            },
          },
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              alignItems: "flex-start",
              mb: 4
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                maxWidth: '100%'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.isUser ? 'primary.main' : 'secondary.main',
                  width: 32,
                  height: 32,
                }}
              >
                {message.isUser ? 'Y' : 'AI'}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 'bolder',
                    fontSize: 18
                  }}
                >
                  {message.isUser ? 'You' : 'ChatGPT'}
                </Typography>
                <Typography>{message.text}</Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Paper>

      <div className="home-input-wrap">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Message ChatGPT"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          size="small"
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#fff',
              'fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#bdbdbd',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#bdbdbd',
              },
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <SendIcon />
        </IconButton>
      </div>
    </Container>
  );
}
