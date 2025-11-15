import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
}

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ open, onClose, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when modal opens
  useEffect(() => {
    if (open && userId) {
      loadChatHistory();
    }
  }, [open, userId]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`http://localhost:4015/history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.conversation && data.conversation.messages) {
          const historicalMessages: Message[] = data.conversation.messages.map((msg: any, index: number) => [
            {
              id: `${msg.timestamp}-user-${index}`,
              text: msg.userMessage,
              sender: 'user' as const,
              timestamp: new Date(msg.timestamp),
            },
            {
              id: `${msg.timestamp}-bot-${index}`,
              text: msg.botResponse,
              sender: 'bot' as const,
              timestamp: new Date(msg.timestamp),
              intent: msg.intent,
            },
          ]).flat();
          setMessages(historicalMessages);
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      // Don't show error for history load failure
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4015/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          message: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        intent: data.intent,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: 'Weather', message: "What's the weather today?" },
    { label: 'Medications', message: 'What medicines should I take today?' },
    { label: 'Community Events', message: 'Find community events near me' },
    { label: 'Play Game', message: "I want to play a game" },
  ];

  const handleQuickAction = (message: string) => {
    setInputMessage(message);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '600px',
          maxHeight: '90vh',
          borderRadius: 3,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#0ea5a4',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Companion
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Chat Messages */}
      <DialogContent
        sx={{
          bgcolor: '#f5f5f5',
          p: 3,
          pt: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          overflowY: 'auto',
        }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Message (shown at start) */}
        {messages.length === 0 && (
          <Box sx={{ mt: 1 }}>
            <Paper
              sx={{
                p: 2.5,
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid #e0f2f1',
                mb: 2,
              }}
            >
              <Typography variant="body1" sx={{ color: '#0ea5a4', fontWeight: 500, mb: 1 }}>
                👋 Hello! I'm your AI Companion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                I can help you with weather updates, medications, finding community events, and more.
                Try one of the quick actions below or just ask me anything!
              </Typography>
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
              Quick actions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {quickActions.map((action) => (
                <Paper
                  key={action.label}
                  onClick={() => handleQuickAction(action.message)}
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    cursor: 'pointer',
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#e0f2f1',
                      borderColor: '#0ea5a4',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(14, 165, 164, 0.15)',
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {action.label}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: 1.5,
              animation: 'fadeIn 0.3s ease-in',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {message.sender === 'bot' && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: '#e0f2f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <SmartToyIcon sx={{ color: '#0ea5a4', fontSize: 20 }} />
              </Box>
            )}
            <Paper
              elevation={message.sender === 'user' ? 0 : 1}
              sx={{
                p: 2,
                maxWidth: '75%',
                bgcolor: message.sender === 'user' ? '#0ea5a4' : 'white',
                color: message.sender === 'user' ? 'white' : 'text.primary',
                borderRadius: 3,
                borderTopRightRadius: message.sender === 'user' ? 4 : 16,
                borderTopLeftRadius: message.sender === 'bot' ? 4 : 16,
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {message.text}
              </Typography>
              {message.intent && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-block',
                    mt: 1,
                    px: 1,
                    py: 0.5,
                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 1,
                    fontStyle: 'italic',
                    fontSize: '0.7rem',
                  }}
                >
                  🎯 {message.intent}
                </Typography>
              )}
            </Paper>
            {message.sender === 'user' && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PersonIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              </Box>
            )}
          </Box>
        ))}

        {/* Loading indicator */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: 1.5,
              animation: 'fadeIn 0.3s ease-in',
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#e0f2f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SmartToyIcon sx={{ color: '#0ea5a4', fontSize: 20 }} />
            </Box>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 3,
                borderTopLeftRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CircularProgress size={18} sx={{ color: '#0ea5a4' }} />
              <Typography variant="body2" color="text.secondary">
                Thinking...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </DialogContent>

      {/* Input Area */}
      <Box
        sx={{
          p: 2.5,
          bgcolor: 'white',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-end',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f8f9fa',
              '&:hover': {
                bgcolor: '#f0f0f0',
              },
              '&.Mui-focused': {
                bgcolor: 'white',
              },
            },
          }}
        />
        <IconButton
          onClick={sendMessage}
          disabled={!inputMessage.trim() || loading}
          sx={{
            width: 48,
            height: 48,
            bgcolor: '#0ea5a4',
            color: 'white',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: '#028489',
              transform: 'scale(1.05)',
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#9e9e9e',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Dialog>
  );
};

export default ChatModal;
