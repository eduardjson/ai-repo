import { useParams, useNavigate } from '@tanstack/react-router'
import { Box, Typography, Card, CardContent, Avatar, Chip, Grid, IconButton, CircularProgress, Divider } from '@mui/material'
import { ArrowBack, Email, Phone, CalendarMonth } from '@mui/icons-material'
import { useGetUserQuery } from '../../api/warehouseApi'
import { format } from 'date-fns'

export function EmployeeDetailPage() {
  const params = useParams({ from: '/_private/employees/$employeeId' })
  const employeeId = params.employeeId
  const navigate = useNavigate()
  const { data: user, isLoading } = useGetUserQuery(employeeId)

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (!user) return <Typography>Пользователь не найден</Typography>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate({ to: '/employees' })}><ArrowBack /></IconButton>
        <Typography variant="h4" fontWeight={700}>Профиль</Typography>
      </Box>
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar src={user.avatar} sx={{ width: 96, height: 96, mb: 2, fontSize: 36 }}>{user.firstName?.[0] || user.email[0].toUpperCase()}</Avatar>
            <Typography variant="h5" fontWeight={600}>{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>{user.role?.map((r) => <Chip key={r} label={r} color="primary" variant="outlined" />)}</Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Email color="action" />
                <Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{user.email}</Typography></Box>
              </Box>
            </Grid>
            {user.phone && <Grid size={{ xs: 12, sm: 6 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}><Phone color="action" /><Box><Typography variant="caption" color="text.secondary">Телефон</Typography><Typography>{user.phone}</Typography></Box></Box></Grid>}
            <Grid size={{ xs: 12, sm: 6 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}><CalendarMonth color="action" /><Box><Typography variant="caption" color="text.secondary">Дата регистрации</Typography><Typography>{format(new Date(user.createdAt), 'dd.MM.yyyy')}</Typography></Box></Box></Grid>
            {user.username && <Grid size={{ xs: 12, sm: 6 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}><Box><Typography variant="caption" color="text.secondary">Имя пользователя</Typography><Typography>{user.username}</Typography></Box></Box></Grid>}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
