import type { ReactNode } from 'react'
import {
  Box,
  Card,
  Avatar,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Email, Phone, AlternateEmail, CalendarMonth } from '@mui/icons-material'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { UserDto } from '@shared/types'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Администратор',
  USER: 'Сотрудник',
}

interface ProfileCardProps {
  user: UserDto
  actions?: ReactNode
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <ListItem disableGutters sx={{ py: 0.75 }}>
      <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>{icon}</ListItemIcon>
      <ListItemText
        primary={value}
        secondary={label}
        primaryTypographyProps={{ variant: 'body2', fontWeight: 500, sx: { wordBreak: 'break-all' } }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
    </ListItem>
  )
}

export function ProfileCard({ user, actions }: ProfileCardProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email

  return (
    <Card elevation={2} sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 55%, #42a5f5 100%)',
          color: '#fff',
          py: 4,
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Avatar
          src={user.avatar}
          sx={{ width: 96, height: 96, fontSize: 36, mb: 2, border: '4px solid rgba(255,255,255,0.45)', boxShadow: 3 }}
        >
          {fullName[0]?.toUpperCase() || '?'}
        </Avatar>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>{fullName}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {user.role?.map((r) => (
            <Chip
              key={r}
              label={ROLE_LABELS[r] ?? r}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 600 }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <List disablePadding>
          <InfoRow icon={<Email fontSize="small" />} label="Email" value={user.email} />
          {user.phone && <InfoRow icon={<Phone fontSize="small" />} label="Телефон" value={user.phone} />}
          {user.username && <InfoRow icon={<AlternateEmail fontSize="small" />} label="Имя пользователя" value={user.username} />}
          <InfoRow
            icon={<CalendarMonth fontSize="small" />}
            label="В системе с"
            value={format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: ru })}
          />
        </List>

        {actions && (
          <>
            <Divider sx={{ my: 2 }} />
            {actions}
          </>
        )}
      </Box>
    </Card>
  )
}
