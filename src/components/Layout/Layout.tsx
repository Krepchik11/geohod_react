import React, { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Badge } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  avatar?: string;
  avatarColor?: string;
  avatarText?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
  showSearch?: boolean;
  showExpandMore?: boolean;
  showAvatar?: boolean;
  onBackClick?: () => void;
  onMenuClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onSearchClick?: () => void;
  onAvatarClick?: () => void;
  unreadCount?: number;
  bottomElement?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'GeoHod',
  subtitle,
  avatar,
  avatarColor = '#f50057',
  avatarText,
  showBackButton = false,
  showMenu = true,
  showSearch = false,
  showExpandMore = false,
  showAvatar = false,
  onBackClick = () => {},
  onMenuClick = () => {},
  onSearchClick = () => {},
  onAvatarClick = () => {},
  unreadCount = 0,
  bottomElement,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          {showBackButton && (
            <IconButton edge="start" color="inherit" onClick={onBackClick} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}

          {showAvatar && (
            <Avatar
              src={avatar}
              sx={{
                bgcolor: avatarColor,
                mr: 2,
              }}
              onClick={onAvatarClick}
            >
              {avatarText}
            </Avatar>
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {showSearch && (
            <IconButton color="inherit" onClick={onSearchClick}>
              <SearchIcon />
            </IconButton>
          )}

          {showExpandMore && (
            <IconButton color="inherit">
              <ExpandMoreIcon />
            </IconButton>
          )}

          {showMenu && (
            <IconButton edge="end" color="inherit" onClick={onMenuClick}>
              <Badge color="primary" variant="dot" invisible={!unreadCount}>
                <MoreVertIcon />
              </Badge>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, overflow: 'auto' }}>
        {children}
      </Box>

      {bottomElement && <Box>{bottomElement}</Box>}
    </Box>
  );
};

export default Layout;
