import { useParams, useNavigate } from '@tanstack/react-router'
import { Box, Typography, IconButton, CircularProgress } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useGetUserQuery } from '../../api/warehouseApi'
import { ProfileCard } from '../../components/ProfileCard'

export function EmployeeDetailPage() {
  const params = useParams({ from: '/_private/employees/$employeeId' })
  const navigate = useNavigate()
  const { data: user, isLoading } = useGetUserQuery(params.employeeId)

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (!user) return <Typography>Пользователь не найден</Typography>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate({ to: '/employees' })}><ArrowBack /></IconButton>
        <Typography variant="h4">Профиль</Typography>
      </Box>
      <Box sx={{ maxWidth: 460 }}>
        <ProfileCard user={user} />
      </Box>
    </Box>
  )
}
