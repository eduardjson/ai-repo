import { useNavigate } from '@tanstack/react-router'
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Avatar, Chip } from '@mui/material'
import { useGetUsersQuery } from '../../api/warehouseApi'
import { format } from 'date-fns'

export function EmployeeListPage() {
  const navigate = useNavigate()
  const { data: users } = useGetUsersQuery()

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Сотрудники</Typography>
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead><TableRow><TableCell>Сотрудник</TableCell><TableCell>Email</TableCell><TableCell>Роль</TableCell><TableCell>Дата регистрации</TableCell></TableRow></TableHead>
          <TableBody>
            {users?.map((u) => (
              <TableRow key={u.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate({ to: `/employees/${u.id}` })}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={u.avatar} sx={{ width: 36, height: 36 }}>{u.firstName?.[0] || u.email[0].toUpperCase()}</Avatar>
                    <Typography variant="body2" fontWeight={500}>{u.firstName || u.username || u.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{u.role?.map((r) => <Chip key={r} label={r} size="small" variant="outlined" />)}</Box></TableCell>
                <TableCell>{format(new Date(u.createdAt), 'dd.MM.yyyy')}</TableCell>
              </TableRow>
            ))}
            {(!users || users.length === 0) && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет сотрудников</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
