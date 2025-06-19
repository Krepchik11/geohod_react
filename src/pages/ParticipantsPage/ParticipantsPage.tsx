import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, CircularProgress } from '@mui/material';
import Toast from '../../components/Toast/Toast';
import { useUserStore } from '../../store/userStore';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { api } from '../../api/telegramApi';
import TopBar from '../../components/TopBar/TopBar';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '../../assets/icons/chat.svg';
import DeleteIcon from '../../assets/icons/delete.svg';

const ParticipantsPage: React.FC = () => {
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <TopBar title="Список участников" showBackButton />
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
        <Typography align="center" sx={{ mt: 4, color: '#8E8E93' }}>
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
                borderBottom: '1px solid #E5E5EA',
                borderTop: '1px solid #E5E5EA',
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
                <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
                  {p.name || `${p.firstName || ''} ${p.lastName || ''}`}
                </Typography>
                {p.username || p.tgUsername ? (
                  <Typography sx={{ color: '#8E8E93', fontSize: 15 }}>
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
                    bgcolor: '#007AFF',
                    borderRadius: '50%',
                    '&:hover': { bgcolor: '#0056b3' },
                  }}
                >
                  <img
                    src={ChatIcon}
                    alt="chat"
                    width={24}
                    height={24}
                  />
                </IconButton>

                {isOrganizer && (
                  <IconButton
                    onClick={() => setDialog({ open: true, participant: p })}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: '#FF3B30',
                      borderRadius: '50%',
                      '&:hover': { bgcolor: '#d32f2f' },
                    }}
                  >
                    <img
                      src={DeleteIcon}
                      alt="delete"
                      width={20}
                      height={20}
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
        onClose={() => setDialog({ open: false, participant: null })}
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
              bgcolor: '#F2F2F7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
            }}
            onClick={() => setDialog({ open: false, participant: null })}
          >
            <CloseIcon sx={{ color: '#8E8E93', fontSize: 22 }} />
          </Box>
        )}
        <DialogContent sx={{ p: 3, pb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 400, mb: 2 }}>
            Вы удаляете запись на событие для следующего участника
          </Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 500, mb: 1, color: '#007AFF' }}>
            Участники
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={dialog.participant?.imageUrl || dialog.participant?.tgImageUrl}
              alt={dialog.participant?.name || dialog.participant?.firstName}
              sx={{ width: 44, height: 44, mr: 1 }}
            />
            <Typography sx={{ fontWeight: 600, fontSize: 17 }}>
              {dialog.participant?.name ||
                `${dialog.participant?.firstName || ''} ${dialog.participant?.lastName || ''}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setDialog({ open: false, participant: null })}
              sx={{
                borderRadius: '14px',
                fontSize: 17,
                textTransform: 'none',
                height: 44,
                color: '#007AFF',
                border: '1.5px solid #007AFF',
                '&:hover': { bgcolor: '#007AFF', color: '#fff' },
              }}
            >
              Отменить
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              sx={{ borderRadius: '14px', fontSize: 17, textTransform: 'none', height: 44 }}
              onClick={async () => {
                try {
                  // TODO: Implement participant removal API call
                  // await api.events.removeParticipant(id!, dialog.participant.id);
                  setParticipants(participants.filter(p => p.id !== dialog.participant.id));
                  setDialog({ open: false, participant: null });
                  setToast({ isVisible: true, message: 'Участник удален' });
                } catch (error: any) {
                  setToast({ isVisible: true, message: error.message || 'Ошибка при удалении' });
                }
              }}
            >
              Удалить
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ParticipantsPage;
