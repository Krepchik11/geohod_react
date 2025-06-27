import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Button, Checkbox, TextField, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../api/telegramApi';

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

  useEffect(() => {
    // Загрузка данных события и участников
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
        sendVote,
        sendDonation,
        donation: sendDonation ? donation : undefined,
      });
      setSuccessOpen(true);
    } finally {
      setFinishLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', p: 2 }}>
      <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 2 }}>Завершение события</Typography>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 14, color: '#8E8E93', mb: 0.5 }}>Название события</Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#000' }}>{event.name}</Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 14, color: '#8E8E93', mb: 0.5 }}>Дата</Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#000' }}>
            {new Date(event.date).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 14, color: '#8E8E93', mb: 0.5 }}>Человек в группе</Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#000' }}>
            <span style={{ color: '#007AFF' }}>{event.participantsCount}</span> из {event.maxParticipants}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 14, color: '#8E8E93', mb: 0.5 }}>Участники</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {participants.slice(0, 5).map((p) => (
              <Avatar key={p.id} src={p.imageUrl || p.tgImageUrl} sx={{ width: 32, height: 32, ml: -1 }} />
            ))}
            <Typography sx={{ ml: 1, fontSize: 15, fontWeight: 500 }}>{participants.length} человек</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 500, fontSize: 15, mb: 1 }}>Направить участникам</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Checkbox checked={sendVote} onChange={e => setSendVote(e.target.checked)} />
          <Typography>Ссылку для голосования</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Checkbox checked={sendDonation} onChange={e => setSendDonation(e.target.checked)} />
          <Typography>Информация о донате</Typography>
          <TextField
            value={donation}
            onChange={e => setDonation(e.target.value)}
            disabled={!sendDonation}
            placeholder="500 динар"
            size="small"
            sx={{ ml: 2, width: 120 }}
          />
        </Box>
      </Box>
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2, height: 48, fontSize: 17 }}
        disabled={finishLoading || (sendDonation && !donation.trim())}
        onClick={handleFinish}
      >
        Завершить событие
      </Button>
      <Dialog open={successOpen} onClose={() => { setSuccessOpen(false); navigate('/events'); }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Вы успешно завершили событие</span>
            <IconButton onClick={() => { setSuccessOpen(false); navigate('/events'); }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 600, fontSize: 17 }}>{event.name}</Typography>
          <Typography sx={{ color: '#8E8E93', fontSize: 16, mb: 1 }}>{new Date(event.date).toLocaleDateString('ru-RU')}</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: 15, mb: 1 }}>Следующие участники получили уведомление о завершении события</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {participants.slice(0, 5).map((p) => (
              <Avatar key={p.id} src={p.imageUrl || p.tgImageUrl} sx={{ width: 32, height: 32, ml: -1 }} />
            ))}
            <Typography sx={{ ml: 1 }}>{participants.length} человек</Typography>
          </Box>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => { setSuccessOpen(false); navigate('/events'); }}
          >
            Закрыть
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FinishEventPage; 