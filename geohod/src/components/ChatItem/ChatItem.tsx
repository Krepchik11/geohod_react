import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Badge,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { Chat } from '../../models/Event';
import { formatRelativeTime } from '../../utils/formatters';

interface ChatItemProps {
  chat: Chat;
  onClick?: () => void;
  selected?: boolean;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, onClick, selected = false }) => {
  const otherParticipant =
    chat.participants.find((p) => p.id !== 'current') || chat.participants[0];
  const chatName = chat.event ? chat.event.title : otherParticipant.name;

  const chatAvatar = otherParticipant.avatar;

  const lastMessageText = chat.lastMessage?.text || 'Нет сообщений';

  const lastMessageTime = chat.lastMessage
    ? formatRelativeTime(new Date(chat.lastMessage.timestamp))
    : '';

  return (
    <>
      <ListItem
        alignItems="flex-start"
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: selected ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
          },
        }}
        onClick={onClick}
      >
        <ListItemAvatar>
          <Badge
            overlap="circular"
            badgeContent={chat.unreadCount || 0}
            color="primary"
            invisible={!chat.unreadCount}
          >
            {otherParticipant.avatar ? (
              <Avatar src={chatAvatar} alt={chatName} />
            ) : (
              <Avatar sx={{ bgcolor: chat.event?.category.color || '#f50057' }}>
                {chat.event ? chat.event.category.shortName : otherParticipant.name.charAt(0)}
              </Avatar>
            )}
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" fontWeight={chat.unreadCount ? 600 : 400} noWrap>
                {chatName}
              </Typography>
              {lastMessageTime && (
                <Typography variant="caption" color="text.secondary">
                  {lastMessageTime}
                </Typography>
              )}
            </Box>
          }
          secondary={
            <Typography
              variant="body2"
              color={chat.unreadCount ? 'text.primary' : 'text.secondary'}
              fontWeight={chat.unreadCount ? 500 : 400}
              noWrap
            >
              {lastMessageText}
            </Typography>
          }
        />
      </ListItem>
      <Divider component="li" sx={{ ml: 9 }} />
    </>
  );
};

export default ChatItem;
