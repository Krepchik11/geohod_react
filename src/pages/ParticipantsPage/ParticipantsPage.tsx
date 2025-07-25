import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, CircularProgress, useTheme } from '@mui/material';
import Toast from '../../components/Toast/Toast';
import { useUserStore } from '../../store/userStore';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { api } from '../../api/telegramApi';
import TopBar from '../../components/TopBar/TopBar';
import CloseIcon from '@mui/icons-material/Close';

const ParticipantsPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const user = useUserStore((state) => state.user);
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const [dialog, setDialog] = useState<{ open: boolean; participant: any | null }>({
    open: false,
    participant: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const isOrganizer = event && user && event.author.id === String(user.id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, participantsRes] = await Promise.all([
          api.events.getEventById(id!),
          api.events.getEventParticipants(id!),
        ]);
        setEvent(eventRes);
        setParticipants(participantsRes.participants || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <TopBar title="Список участников" showBackButton showNotifications={false} />
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type="error"
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : participants.length === 0 ? (
        <Typography align="center" sx={{ mt: 4, color: theme.palette.text.secondary }}>
          У данного события отсутствуют участники
        </Typography>
      ) : (
        <Box sx={{ px: 2 }}>
          {participants.map((p) => (
            <Box
              key={p.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`,
                borderTop: `1px solid ${theme.palette.divider}`,
                py: 2,
                gap: 2,
              }}
            >
              <Avatar
                src={p.imageUrl || p.tgImageUrl}
                alt={p.name || p.firstName}
                sx={{ width: 44, height: 44, mr: 0 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {p.name || `${p.firstName || ''} ${p.lastName || ''}`}
                </Typography>
                {p.username || p.tgUsername ? (
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: 14 }}>
                    @{p.username || p.tgUsername}
                  </Typography>
                ) : null}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <IconButton
                  component="a"
                  href={`https://t.me/${p.username || p.tgUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 40,
                    height: 40,
                    mr: 1,
                    borderRadius: '50%',
                    color: theme.palette.primary.main,
                  }}
                >
                  <img
                    src="/assets/icons/chat.svg"
                    alt="chat"
                    width={24}
                    height={24}
                    style={{
                      filter:
                        'invert(80%) sepia(70%) saturate(5000%) hue-rotate(201deg) brightness(95%) contrast(101%)',
                    }}
                  />
                </IconButton>

                {isOrganizer && (
                  <IconButton
                    onClick={() => setDialog({ open: true, participant: p })}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                    }}
                  >
                    <img
                      src="/assets/icons/delete.svg"
                      alt="delete"
                      width={20}
                      height={20}
                      style={{
                        filter:
                          'invert(80%) sepia(70%) saturate(5000%) hue-rotate(201deg) brightness(95%) contrast(101%)',
                      }}
                    />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <Dialog
        open={dialog.open}
        onClose={() => !isDeleting && setDialog({ open: false, participant: null })}
        maxWidth="xs"
        fullWidth
      >
        {!toast.isVisible && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              width: 36,
              height: 36,
              bgcolor: theme.palette.action.hover,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
            }}
            onClick={() => !isDeleting && setDialog({ open: false, participant: null })}
          >
            <CloseIcon sx={{ color: theme.palette.text.secondary, fontSize: 22 }} />
          </Box>
        )}
        <DialogContent sx={{ p: 3, pb: 2 }}>
          <Typography
            sx={{ fontSize: 15, fontWeight: 400, mb: 2, color: theme.palette.text.primary }}
          >
            Вы удаляете запись на событие для следующего участника
          </Typography>
          <Typography
            sx={{ fontSize: 15, fontWeight: 500, mb: 1, color: theme.palette.primary.main }}
          >
            Участники
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={dialog.participant?.imageUrl || dialog.participant?.tgImageUrl}
              alt={dialog.participant?.name || dialog.participant?.firstName}
              sx={{ width: 44, height: 44, mr: 1 }}
            />
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: theme.palette.text.primary }}>
              {dialog.participant?.name ||
                `${dialog.participant?.firstName || ''} ${dialog.participant?.lastName || ''}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              disabled={isDeleting}
              onClick={() => setDialog({ open: false, participant: null })}
              sx={{
                borderRadius: '14px',
                fontSize: 16,
                textTransform: 'none',
                height: 44,
                color: theme.palette.primary.main,
                border: `1.5px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                },
              }}
            >
              Отменить
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              disabled={isDeleting}
              sx={{ borderRadius: '14px', fontSize: 17, textTransform: 'none', height: 44 }}
              onClick={async () => {
                try {
                  setIsDeleting(true);
                  // Отправляем запрос на удаление участника
                  await api.events.removeEventParticipant(id!, dialog.participant.id);

                  // Обновляем локальное состояние
                  setParticipants(participants.filter((p) => p.id !== dialog.participant.id));
                  setDialog({ open: false, participant: null });
                  setToast({ isVisible: true, message: 'Участник удален' });
                } catch (error: any) {
                  setToast({
                    isVisible: true,
                    message: error.message || 'Ошибка при удалении участника',
                  });
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ParticipantsPage;
