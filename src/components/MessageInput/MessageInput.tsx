import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoodIcon from '@mui/icons-material/Mood';

interface MessageInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  placeholder = 'Напишите сообщение...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <IconButton color="default" disabled={disabled}>
        <AttachFileIcon />
      </IconButton>

      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        multiline
        maxRows={4}
        sx={{
          mx: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: '0.8rem',
            paddingTop: '8px',
            paddingBottom: '8px',
          },
        }}
      />

      <Box sx={{ display: 'flex' }}>
        <IconButton color="default" disabled={disabled}>
          <MoodIcon />
        </IconButton>

        <IconButton color="primary" onClick={handleSend} disabled={!message.trim() || disabled}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MessageInput;
