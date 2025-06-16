import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { Message } from '../../models/Event';
import { formatTime } from '../../utils/formatters';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCurrentUser, showAvatar = true }) => {
  const messageTime = formatTime(new Date(message.timestamp));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        mb: 1.5,
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
      }}
    >
      {!isCurrentUser && showAvatar && (
        <Avatar
          src={message.sender.avatar}
          alt={message.sender.name}
          sx={{
            width: 36,
            height: 36,
            mr: 1,
            mt: 0.5,
          }}
        >
          {message.sender.name.charAt(0)}
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!isCurrentUser && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5, mb: 0.5 }}>
            {message.sender.name}
          </Typography>
        )}

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: isCurrentUser ? '#e3f2fd' : '#f5f5f5',
            ml: isCurrentUser ? 2 : 0,
          }}
        >
          <Typography variant="body2">{message.text}</Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {messageTime}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {isCurrentUser && showAvatar && (
        <Avatar
          src={message.sender.avatar}
          alt={message.sender.name}
          sx={{
            width: 36,
            height: 36,
            ml: 1,
            mt: 0.5,
          }}
        >
          {message.sender.name.charAt(0)}
        </Avatar>
      )}
    </Box>
  );
};

export default MessageItem;
