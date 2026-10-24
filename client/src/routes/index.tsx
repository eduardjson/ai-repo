import { Grid, Typography, Box, Card, CardContent, Paper } from '@mui/material'
import { People, Business, CheckCircle, Build } from '@mui/icons-material'
import { useGetShipmentsQuery, useGetObjectsQuery, useGetUsersQuery } from '../api/warehouseApi'

export function DashboardPage() {
  const { data: users } = useGetUsersQuery()
  const { data: objects } = useGetObjectsQuery()
  const { data: shipments } = useGetShipmentsQuery({})

  const employeesCount = users?.length ?? 0
  const objectsCount = objects?.length ?? 0
  const completedShipments = shipments?.filter(s => s.status === 'COMPLETED').length ?? 0
  const activeShipments = shipments?.filter(s => s.status === 'PENDING').length ?? 0

  const cards = [
    { label: 'Сотрудники', value: employeesCount, icon: <People sx={{ fontSize: 40 }} />, color: '#1976d2' },
    { label: 'Объекты', value: objectsCount, icon: <Business sx={{ fontSize: 40 }} />, color: '#dc004e' },
    { label: 'Завершено', value: completedShipments, icon: <CheckCircle sx={{ fontSize: 40 }} />, color: '#2e7d32' },
    { label: 'Активные', value: activeShipments, icon: <Build sx={{ fontSize: 40 }} />, color: '#ed6c02' },
  ]

  const recentShipments = shipments?.slice(0, 10) ?? []

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>Дашборд</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
            <Card elevation={2}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
                <Box>
                  <Typography variant="h4" fontWeight={700}>{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h5" gutterBottom fontWeight={600}>Последние отгрузки</Typography>
      <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
        <Box
          sx={{
            overflowX: 'auto',
            '& table': { width: '100%', borderCollapse: 'collapse' },
            '& th, & td': { px: 2, py: 1.5, textAlign: 'left', borderBottom: '1px solid', borderColor: 'divider' },
            '& th': { fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', bgcolor: 'action.hover' },
          }}
        >
          <table>
            <thead>
              <tr><th>Склад</th><th>Объект</th><th>Статус</th><th>Дата</th></tr>
            </thead>
            <tbody>
              {recentShipments.map((s) => (
                <tr key={s.id}>
                  <td>{s.warehouse?.name ?? '-'}</td>
                  <td>{s.object?.name ?? '-'}</td>
                  <td>
                    <Box component="span" sx={{
                      px: 1, py: 0.3, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600,
                      bgcolor: s.status === 'COMPLETED' ? 'success.light' : s.status === 'CANCELLED' ? 'error.light' : 'warning.light',
                      color: s.status === 'COMPLETED' ? 'success.dark' : s.status === 'CANCELLED' ? 'error.dark' : 'warning.dark',
                    }}>
                      {s.status === 'COMPLETED' ? 'Завершена' : s.status === 'CANCELLED' ? 'Отменена' : 'В пути'}
                    </Box>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString('ru-RU')}</td>
                </tr>
              ))}
              {recentShipments.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Нет отгрузок</td></tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  )
}
