import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useUserStore } from '../../store/userStore';
import Toast from '../Toast/Toast';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ru } from 'date-fns/locale';

interface EventFormData {
  title: string;
  maxParticipants: number;
  date: string;
}

interface FormState {
  title: string;
  maxParticipants: string;
  date: string;
  time: string;
}

interface FormErrors {
  maxParticipants?: string;
  date?: string;
  time?: string;
}

interface TouchedFields {
  title: boolean;
  maxParticipants: boolean;
  date: boolean;
  time: boolean;
}

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  initialTitle?: string;
  initialDate?: string;
  initialMaxParticipants?: number;
  submitLabel?: string;
  onInputFocusChange?: (focused: boolean) => void;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, initialTitle = '', initialDate, initialMaxParticipants, submitLabel, onInputFocusChange }) => {
  const user = useUserStore((state) => state.user);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const datePickerRef = useRef<any>(null);

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  const [formState, setFormState] = useState<FormState>({
    title: initialTitle,
    maxParticipants: initialMaxParticipants !== undefined ? String(initialMaxParticipants) : '30',
    date: initialDate ? initialDate.split('T')[0] : defaultDate,
    time: initialDate ? (initialDate.split('T')[1]?.slice(0, 5) || defaultTime) : defaultTime,
  });

  const [touched, setTouched] = useState<TouchedFields>({
    title: false,
    maxParticipants: false,
    date: false,
    time: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isValid, setIsValid] = useState(false);

  const showError = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  useEffect(() => {
    const validateForm = () => {
      const newErrors: FormErrors = {};
      let hasErrors = false;

      const participants = Number(formState.maxParticipants);
      if (participants < 1 || participants > 100) {
        newErrors.maxParticipants = `Макс. кол-во участников 100`;
        hasErrors = true;
        if (touched.maxParticipants && participants > 100) {
          showError('Превышено количество участников');
        }
      }

      if (formState.date && formState.time) {
        const selectedDateTime = new Date(formState.date + 'T' + formState.time);
        const now = new Date();

        // Устанавливаем время now к 00:00:00 для сравнения только дат
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const selectedDate = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate());

        if (selectedDate < nowDate) {
          newErrors.date = 'Дата должна быть сегодня или в будущем';
          hasErrors = true;
          if (touched.date && touched.time) {
            showError('Дата должна быть сегодня или в будущем');
          }
        }
      }

      setErrors(newErrors);

      const isFormValid =
        formState.title.trim() !== '' &&
        formState.maxParticipants !== '' &&
        formState.date !== '' &&
        formState.time !== '' &&
        !hasErrors;

      setIsValid(isFormValid);
    };
    validateForm();
  }, [formState, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('handleChange called:', name, value);

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (name === 'maxParticipants') {
      const numValue = Number(value);
      if (numValue > 100) {
        showError('Превышено количество участников');
        return;
      }
    }

    setFormState((prev) => {
      console.log('Updating form state:', { ...prev, [name]: value });
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleDateChange = (newValue: Date | null) => {
    console.log('handleDateChange called:', newValue);
    
    setTouched((prev) => ({
      ...prev,
      date: true,
    }));

    if (newValue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newValue < today) {
        setErrors((prev) => ({
          ...prev,
          date: 'Дата должна быть в будущем',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          date: undefined,
        }));
      }
    }

    setFormState((prev) => {
      const newState = {
        ...prev,
        date: newValue ? newValue.toISOString().split('T')[0] : '',
      };
      console.log('Updating form state with new date:', newState);
      return newState;
    });
  };
  useEffect(() => {
    if (touched.date && errors.date) {
      showError('Дата должна быть в будущем');
    }
  }, [errors.date, touched.date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // При отправке формы помечаем все поля как тронутые
    setTouched({
      title: true,
      maxParticipants: true,
      date: true,
      time: true,
    });

    if (!isValid) return;

    // Форматируем дату и время в ISO строку для бэкенда
    const dateTime = new Date(formState.date + 'T' + formState.time);
    const isoString = dateTime.toISOString();

    onSubmit({
      title: formState.title,
      maxParticipants: Number(formState.maxParticipants),
      date: isoString,
    });
  };

  // Фокусировка для скрытия меню
  const handleFocus = () => {
    if (onInputFocusChange) onInputFocusChange(true);
  };
  const handleBlur = () => {
    if (onInputFocusChange) onInputFocusChange(false);
  };

  if (!user) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Toast message={toastMessage} isVisible={showToast} type="error" />

      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 600,
          pb: 0,
          mb: 3,
          fontFamily: 'Roboto, sans-serif',
        }}
      >
        Создать событие
      </Typography>

      <Box
        sx={{
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 2,
            cursor: 'pointer',
          }}
        >
          <Box
            component="img"
            src={user.photo_url}
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: '#000',
              }}
            >
              {user.first_name} {user.last_name}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: '#8E8E93',
              }}
            >
              Организатор
            </Typography>
          </Box>
          <Box
            sx={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8E8E93',
              transition: 'transform 0.3s ease',
            }}
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>

        <Box sx={{ pb: 2 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DriveFileRenameOutlineIcon sx={{ fontSize: 20 }} />
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
                  }}
                >
                  Название
                </Typography>
              </Box>
              <TextField
                fullWidth
                name="title"
                value={formState.title}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Введите название"
                variant="outlined"
                error={touched.title && formState.title.trim() === ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      border: '1px solid #C5C6CC',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PeopleAltIcon sx={{ fontSize: 20 }} />
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
                  }}
                >
                  Максимальное количество участников
                </Typography>
              </Box>
              <TextField
                fullWidth
                name="maxParticipants"
                type="number"
                value={formState.maxParticipants ?? ''}
                onChange={handleChange}
                placeholder="30"
                error={touched.maxParticipants && !!errors.maxParticipants}
                helperText={touched.maxParticipants ? errors.maxParticipants : ''}
                inputProps={{ min: 1, max: 100 }}
                variant="outlined"
                onFocus={handleFocus}
                onBlur={handleBlur}
                FormHelperTextProps={{
                  sx: {
                    textAlign: 'right',
                    marginRight: '0',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      border: '1px solid #C5C6CC',
                    },
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      '-webkit-appearance': 'none',
                      margin: 0,
                    },
                    '& input[type=number]': {
                      '-moz-appearance': 'textfield',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EventAvailableIcon sx={{ fontSize: 20 }} />
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
                  }}
                >
                  Дата
                </Typography>
              </Box>
              <LocalizationProvider 
                dateAdapter={AdapterDateFns} 
                adapterLocale={ru}
                localeText={{
                  cancelButtonLabel: 'Отмена',
                  okButtonLabel: 'ОК',
                }}
              >
                <DatePicker
                  ref={datePickerRef}
                  value={formState.date ? new Date(formState.date) : null}
                  onChange={handleDateChange}
                  format="dd.MM.yyyy"
                  enableAccessibleFieldDOMStructure={false}
                    slots={{
                      textField: TextField,
                    }}
                    slotProps={{
                      actionBar: {
                        actions: ['cancel', 'accept'],
                        sx: {
                          '& .MuiButton-root': {
                            color: '#000000',
                            fontWeight: 500,
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                          },
                        },
                      },
                      mobilePaper: {
                        sx: {
                          '& .MuiPickersToolbar-root': {
                            color: '#000000',
                          },
                        },
                      },
                      textField: {
                        error: touched.date && !!errors.date,
                        helperText: touched.date && errors.date ? errors.date : undefined,
                        fullWidth: true,
                        onClick: () => {
                          // Программно открываем календарь при клике на поле
                          setTimeout(() => {
                            const calendarButton = document.querySelector('[aria-label="Choose date"], .MuiIconButton-root') as HTMLElement;
                            if (calendarButton) {
                              calendarButton.click();
                            }
                          }, 0);
                        },
                        InputProps: { 
                          readOnly: true, 
                          onFocus: handleFocus, 
                          onBlur: handleBlur,
                          style: { cursor: 'pointer' },
                          inputProps: {
                            readOnly: true,
                            autoComplete: 'off',
                            style: { cursor: 'pointer' },
                            onKeyDown: (e: React.KeyboardEvent) => {
                              e.preventDefault();
                            }
                          }
                        },
                      FormHelperTextProps: {
                        sx: {
                          textAlign: 'right',
                          marginRight: '0',
                        },
                      },
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& fieldset': {
                            border: '1px solid #C5C6CC',
                            borderRadius: '12px',
                          },
                        },
                        '& .MuiInputBase-input': {
                          padding: '14px',
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isValid}
              sx={{
                height: 48,
                borderRadius: '14px',
                textTransform: 'none',
                fontSize: 16,
                backgroundColor: '#007AFF',
                '&:hover': {
                  backgroundColor: '#0056b3',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 122, 255, 0.5)',
                  color: '#FFFFFF',
                },
                fontFamily: '-apple-system, system-ui, Roboto, sans-serif',
              }}
            >
              {submitLabel || 'Подтвердить'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default EventForm;
