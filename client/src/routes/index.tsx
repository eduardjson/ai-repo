import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tooltip,
} from '@mui/material'
import {
  AccountBalanceWallet,
  Inventory2,
  Warning,
  LocalShipping,
  Description,
  Business,
} from '@mui/icons-material'
import { useDashboardControllerGetSummaryQuery } from '../api/generated'
import { formatCompactMoney } from '../lib/catalog'

const dayNum = (date: string) => String(Number(date.split('-')[2]))
const fullDate = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU')
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}

export function DashboardPage() {
  const { data, isLoading } = useDashboardControllerGetSummaryQuery()

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const cards = [
    {
      label: 'Стоимость запасов',
      value: formatCompactMoney(data.inventoryValue),
      icon: <AccountBalanceWallet sx={{ fontSize: 28 }} />,
      color: 'primary.main',
    },
    {
      label: 'В наличии',
      value: String(data.inStockProducts),
      sub: `из ${data.activeProducts} позиций`,
      icon: <Inventory2 sx={{ fontSize: 28 }} />,
      color: 'success.main',
    },
    {
      label: 'Низкий запас',
      value: String(data.lowStockCount),
      sub: `нет на складе: ${data.outOfStockCount}`,
      icon: <Warning sx={{ fontSize: 28 }} />,
      color: 'warning.main',
    },
    {
      label: 'Отгрузки в работе',
      value: String(data.pendingShipments),
      icon: <LocalShipping sx={{ fontSize: 28 }} />,
      color: 'info.main',
    },
    {
      label: 'Черновики поступлений',
      value: String(data.draftReceipts),
      icon: <Description sx={{ fontSize: 28 }} />,
      color: 'secondary.main',
    },
    {
      label: 'Объекты',
      value: String(data.objectsCount),
      sub: `${data.warehousesCount} складов`,
      icon: <Business sx={{ fontSize: 28 }} />,
      color: 'secondary.main',
    },
  ]

  const trendMax = Math.max(1, ...data.movementTrend.map((p) => Math.max(p.incoming, p.outgoing)))
  const warehouseMax = Math.max(1, ...data.warehouses.map((w) => w.stockValue))

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Дашборд
      </Typography>

      {/* KPI-карточки */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {cards.map((c) => (
          <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2 }} key={c.label}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ color: c.color, display: 'flex' }}>{c.icon}</Box>
                <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
                  {c.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {c.label}
                </Typography>
                {c.sub && (
                  <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
                    {c.sub}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Движение товаров + низкий запас */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Движение товаров, 14 дней
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Legend color="success.main" label="Приход" />
                <Legend color="error.main" label="Расход" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 180 }}>
                {data.movementTrend.map((pt) => {
                  const inH = Math.round((pt.incoming / trendMax) * 130)
                  const outH = Math.round((pt.outgoing / trendMax) * 130)
                  return (
                    <Box
                      key={pt.date}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        minWidth: 0,
                      }}
                    >
                      <Tooltip
                        title={`${fullDate(pt.date)}\nПриход: ${formatCompactMoney(pt.incoming)}\nРасход: ${formatCompactMoney(pt.outgoing)}`}
                        arrow
                      >
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 130 }}>
                          <Box
                            sx={{
                              width: 7,
                              height: inH,
                              minHeight: 2,
                              bgcolor: 'success.main',
                              borderRadius: '3px 3px 0 0',
                            }}
                          />
                          <Box
                            sx={{
                              width: 7,
                              height: outH,
                              minHeight: 2,
                              bgcolor: 'error.main',
                              borderRadius: '3px 3px 0 0',
                            }}
                          />
                        </Box>
                      </Tooltip>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                        {dayNum(pt.date)}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Требуют пополнения
              </Typography>
              {data.lowStock.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Все позиции в норме
                </Typography>
              ) : (
                <Stack gap={1.5}>
                  {data.lowStock.map((item) => (
                    <Box
                      key={item.productId}
                      sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.sku}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" color="warning.main" fontWeight={600}>
                          {item.quantity} / {item.minStock}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.unit}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Стоимость по складам + топ товаров */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Стоимость запасов по складам
              </Typography>
              {data.warehouses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Нет складов
                </Typography>
              ) : (
                <Stack gap={2}>
                  {data.warehouses.map((w) => (
                    <Box key={w.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{w.name}</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCompactMoney(w.stockValue)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          height: 8,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(w.stockValue / warehouseMax) * 100}%`,
                            height: '100%',
                            bgcolor: 'primary.main',
                            borderRadius: 1,
                            minWidth: 2,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {w.skuCount} позиций
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Топ товаров по обороту, 30 дней
              </Typography>
              {data.topProducts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Нет операций за период
                </Typography>
              ) : (
                <Stack gap={1.5}>
                  {data.topProducts.map((p) => (
                    <Box
                      key={p.productId}
                      sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {p.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.sku}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCompactMoney(p.movedValue)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.movedQty} {p.unit}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
