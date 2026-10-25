import type { ReactNode } from 'react'
import { Box, Card, CardContent, Avatar, Typography, Chip, Divider } from '@mui/material'
import { Email, Phone, AlternateEmail, CalendarMonth } from '@mui/icons-material'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { UserDto } from '../api/generated'

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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
    </Box>
  )
}

export function ProfileCard({ user, actions }: ProfileCardProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email

  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            variant="rounded"
            src={user.avatar ?? undefined}
            sx={{ width: 64, height: 64, fontSize: 24, borderRadius: 1 }}
          >
            {fullName[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>{fullName}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {user.role?.map((r) => (
                <Chip key={r} label={ROLE_LABELS[r] ?? r} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <InfoRow icon={<Email fontSize="small" />} label="Email" value={user.email} />
          {user.phone && <InfoRow icon={<Phone fontSize="small" />} label="Телефон" value={user.phone} />}
          {user.username && <InfoRow icon={<AlternateEmail fontSize="small" />} label="Имя пользователя" value={user.username} />}
          <InfoRow
            icon={<CalendarMonth fontSize="small" />}
            label="В системе с"
            value={format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: ru })}
          />
        </Box>

        {actions && (
          <>
            <Divider sx={{ my: 2 }} />
            {actions}
          </>
        )}
      </CardContent>
    </Card>
  )
}
