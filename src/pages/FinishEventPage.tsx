import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Checkbox,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../api/telegramApi';
import EventIcon from '@mui/icons-material/Event';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useUserStore } from '../store/userStore';

const FinishEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [sendVote, setSendVote] = useState(true);
  const [sendDonation, setSendDonation] = useState(false);
  const [donation, setDonation] = useState('');
  const [finishLoading, setFinishLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const settings = useUserStore((state) => state.settings);
  const fetchSettings = useUserStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings?.defaultDonationAmount) {
      setDonation(settings.defaultDonationAmount);
    }
  }, [settings]);

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const eventData = await api.events.getEventById(id);
      const participantsData = await api.events.getEventParticipants(id);
      setEvent(eventData);
      setParticipants(participantsData.participants || []);
    };
    fetchData();
  }, [id]);

  const handleFinish = async () => {
    if (!id) return;
    setFinishLoading(true);
    try {
      await api.events.finishEvent(id, {
        sendPollLink: sendVote,
        sendDonationRequest: sendDonation,
        donationInfo: sendDonation ? donation : undefined,
      });
      setSuccessOpen(true);
    } finally {
      setFinishLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOpen(false);
    navigate('/events');
  };

  if (!event) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', p: 2 }}>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 16,
          mb: 2,
          borderBottom: '1px solid',
          borderTop: '1px solid',
          borderColor: '#EFF1F8',
          pb: 2,
          pt: 2,
          mx: -2,
          px: 2,
        }}
      >
        Завершение события
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            mb: 2,
            borderBottom: '1px solid',
            borderColor: '#EFF1F8',
            pb: 2,
            mx: -2,
            px: 2,
          }}
        >
          <Typography sx={{ fontSize: 14, color: '#8E8E93', mb: 0.5 }}>Название события</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#000' }}>
            {event.name}
          </Typography>
        </Box>

        <Box
          sx={{
            mb: 2,
            borderBottom: '1px solid',
            borderColor: '#EFF1F8',
            pb: 2,
            mx: -2,
            px: 2,
          }}
        >
          <Typography sx={{ fontSize: 14, color: '#8E8E93', mb: 0.5 }}>Дата</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon sx={{ fontSize: 20, color: 'black' }} />
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#000' }}>
              {formatDateOnly(event.date)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #EFF1F8', mx: -2, px: 2 }}>
          <Box sx={{ px: 1, pt: 0, pb: 1.5, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: 14, color: '#8E8E93', mb: 0.5 }}>
              Человек в группе
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleAltIcon sx={{ fontSize: 20, color: 'black', mr: 1 }} />
              <Typography
                sx={{
                  fontSize: 15,
                  color: '#007AFF',
                  fontWeight: 600,
                  mr: 0.5,
                }}
              >
                {event.participantsCount || 0}
              </Typography>
              <Typography sx={{ fontSize: 15, color: 'black', fontWeight: 600 }}>
                из {event.maxParticipants}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          {participants.length > 0 && (
            <>
              <Typography sx={{ fontSize: 14, color: '#8E8E93', mb: 1.5, mt: 1.5, px: 1 }}>
                Участники
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 1.6 }}>
                {participants.slice(0, 5).map((p, idx) => (
                  <Avatar
                    key={p.id}
                    src={p.imageUrl || p.tgImageUrl}
                    sx={{
                      width: 32,
                      height: 32,
                      border: '2px solid #007AFF',
                      ml: idx === 0 ? 0 : -1.5,
                      zIndex: participants.length - idx,
                      background: '#fff',
                    }}
                  />
                ))}
                <Typography sx={{ ml: 1, fontSize: 15, fontWeight: '500' }}>
                  {participants.length} человек
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 500, fontSize: 14, mb: 0.5, color: '#8E8E93' }}>
          Направить участникам
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Checkbox
            checked={sendVote}
            onChange={(e) => setSendVote(e.target.checked)}
            sx={{
              p: 0,
              mr: 1,
              mt: 1,
              color: '#C5C6CC',
              borderRadius: '6px',
              '&.Mui-checked': {
                color: '#006FFD',
              },
            }}
          />
          <Typography sx={{ fontSize: 14, mt: 1 }}>Ссылку для голосования</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Checkbox
            checked={sendDonation}
            onChange={(e) => setSendDonation(e.target.checked)}
            sx={{
              p: 0,
              mr: 1,
              color: '#C5C6CC',
              borderRadius: '6px',
              '&.Mui-checked': {
                color: '#006FFD',
              },
            }}
          />
          <Typography sx={{ fontSize: 14 }}>Информация о донате</Typography>
        </Box>
        <TextField
          value={donation}
          onChange={(e) => setDonation(e.target.value)}
          disabled={!sendDonation}
          placeholder="500 динар"
          size="small"
          sx={{ ml: 0.5, width: 237, borderRadius: '12px' }}
        />
      </Box>
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2, height: 48, fontSize: 15, backgroundColor: '#006FFD' }}
        disabled={finishLoading}
        onClick={handleFinish}
      >
        Завершить событие
      </Button>
      <Dialog open={successOpen} onClose={handleCloseSuccess}>
        <Box
          sx={{
            position: 'fixed',
            top: 30,
            right: 30,
            zIndex: 10000,
          }}
        >
          <Box
            component="img"
            src="/images/close-popup.svg"
            alt="Close"
            onClick={handleCloseSuccess}
            sx={{
              width: 50,
              height: 50,
              cursor: 'pointer',
            }}
          />
        </Box>
        <DialogTitle>
          <Box
            sx={{
              fontWeight: 400,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Вы успешно завершили событие</span>
            <IconButton onClick={handleCloseSuccess}></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 600, fontSize: 17 }}>{event.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1 }}>
            <EventIcon sx={{ fontSize: 20, color: '#707579' }} />
            <Typography sx={{ fontSize: 14, fontWeight: 400, color: '#707579' }}>
              {formatDateOnly(event.date)}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 400, fontSize: 14, mb: 1 }}>
            Следующие участники получили уведомление о завершении события
          </Typography>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1, p: 0 }}
          >
            {participants.length > 0 && (
              <>
                <Typography sx={{ fontSize: 14, color: '#007AFF', mb: 1.5, mt: 1.5, px: 1 }}>
                  Участники
                </Typography>
                {participants.slice(0, 5).map((p) => (
                  <Avatar
                    key={p.id}
                    src={p.imageUrl || p.tgImageUrl}
                    sx={{ width: 32, height: 32, ml: -1 }}
                  />
                ))}
                <Typography
                  sx={{
                    ml: participants.length === 0 ? 0 : 1,
                    fontWeight: 400,
                    p: 0,
                    fontSize: 14,
                  }}
                >
                  {participants.length} человек
                </Typography>
              </>
            )}
          </Box>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              mt: 2,
              border: '2px solid #006FFD',
              color: '#006FFD',
              fontSize: 14,
              fontWeight: 400,
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: '#006FFD',
                color: '#fff',
              },
            }}
            onClick={handleCloseSuccess}
          >
            Закрыть
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FinishEventPage;
