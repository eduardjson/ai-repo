import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import { People, Business, CheckCircle, Build } from '@mui/icons-material'
import { useGetShipmentsQuery, useGetObjectsQuery, useGetUsersQuery } from '../api/warehouseApi'
import { useAppSelector } from '../store/hooks'

const statusLabel = (status: string) =>
  status === 'COMPLETED' ? 'Завершена' : status === 'CANCELLED' ? 'Отменена' : 'В пути'

export function DashboardPage() {
  const currentUser = useAppSelector((s) => s.auth.user)
  const isAdmin = currentUser?.role?.includes('ADMIN') ?? false
  const { data: users } = useGetUsersQuery(undefined, { skip: !isAdmin })
  const { data: objects } = useGetObjectsQuery()
  const { data: shipments } = useGetShipmentsQuery({})

  const employeesCount = users?.length ?? 0
  const objectsCount = objects?.length ?? 0
  const completedShipments = shipments?.filter((s) => s.status === 'COMPLETED').length ?? 0
  const activeShipments = shipments?.filter((s) => s.status === 'PENDING').length ?? 0

  const cards = [
    ...(isAdmin
      ? [{ label: 'Сотрудники', value: employeesCount, icon: <People sx={{ fontSize: 40 }} />, color: 'primary.main' }]
      : []),
    { label: 'Объекты', value: objectsCount, icon: <Business sx={{ fontSize: 40 }} />, color: 'secondary.main' },
    { label: 'Завершено', value: completedShipments, icon: <CheckCircle sx={{ fontSize: 40 }} />, color: 'success.main' },
    { label: 'Активные', value: activeShipments, icon: <Build sx={{ fontSize: 40 }} />, color: 'warning.main' },
  ]

  const recentShipments = shipments?.slice(0, 10) ?? []

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Дашборд</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
            <Card elevation={2}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
                <Box>
                  <Typography variant="h4">{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h5" sx={{ mb: 2 }}>Последние отгрузки</Typography>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Склад</TableCell>
              <TableCell>Объект</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentShipments.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.warehouse?.name ?? '-'}</TableCell>
                <TableCell>{s.object?.name ?? '-'}</TableCell>
                <TableCell>
                  <Box component="span" sx={{
                    px: 1, py: 0.3, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600,
                    bgcolor: s.status === 'COMPLETED' ? 'success.light' : s.status === 'CANCELLED' ? 'error.light' : 'warning.light',
                    color: s.status === 'COMPLETED' ? 'success.dark' : s.status === 'CANCELLED' ? 'error.dark' : 'warning.dark',
                  }}>
                    {statusLabel(s.status)}
                  </Box>
                </TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString('ru-RU')}</TableCell>
              </TableRow>
            ))}
            {recentShipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет отгрузок</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
