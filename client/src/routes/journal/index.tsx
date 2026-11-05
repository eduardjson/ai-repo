import { useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, Button, Link, Stack,
} from '@mui/material'
import { debounce } from 'lodash'
import {
  useJournalControllerFindAllQuery,
  useWarehouseControllerFindAllQuery,
  type StockMovementDto,
} from '../../api/generated'
import { MOVEMENT_TYPES, formatQty } from '../../lib/catalog'

function userName(m: StockMovementDto): string {
  const u = m.user
  if (!u) return '—'
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ')
  return name || u.email
}

export function JournalPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [type, setType] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: warehouses } = useWarehouseControllerFindAllQuery()
  const { data, isLoading } = useJournalControllerFindAllQuery({
    page: String(page),
    size: '25',
    search: search || undefined,
    type: type || undefined,
    warehouseId: warehouseId || undefined,
    from: from || undefined,
    to: to || undefined,
  })

  const debouncedSearch = useCallback(debounce((v: string) => setSearch(v), 400), [])

  const reset = () => {
    setLocalSearch(''); setSearch(''); setType(''); setWarehouseId(''); setFrom(''); setTo(''); setPage(1)
  }

  const isReceipt = (m: StockMovementDto) => m.type === 'RECEIPT' || m.type === 'RECEIPT_CANCEL'

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Журнал операций</Typography>

      <Stack direction="row" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <TextField
          size="small"
          placeholder="Поиск: товар, артикул..."
          value={localSearch}
          onChange={(e) => { setLocalSearch(e.target.value); debouncedSearch(e.target.value) }}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Операция</InputLabel>
          <Select value={type} label="Операция" onChange={(e) => setType(e.target.value)}>
            <MenuItem value="">Все</MenuItem>
            {Object.entries(MOVEMENT_TYPES).map(([value, meta]) => (
              <MenuItem key={value} value={value}>{meta.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Склад</InputLabel>
          <Select value={warehouseId} label="Склад" onChange={(e) => setWarehouseId(e.target.value)}>
            <MenuItem value="">Все</MenuItem>
            {warehouses?.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" label="С" type="date" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="По" type="date" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button size="small" onClick={reset}>Сбросить</Button>
      </Stack>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Дата и время</TableCell>
              <TableCell>Операция</TableCell>
              <TableCell>Товар</TableCell>
              <TableCell align="right">Кол-во</TableCell>
              <TableCell>Склад</TableCell>
              <TableCell>Объект</TableCell>
              <TableCell>Документ</TableCell>
              <TableCell>Пользователь</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>Загрузка...</TableCell></TableRow>}
            {data?.items.map((m) => {
              const meta = MOVEMENT_TYPES[m.type] ?? { label: m.type, direction: 'in' as const, color: 'default' as const }
              return (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(m.createdAt).toLocaleString('ru-RU')}</TableCell>
                  <TableCell><Chip label={meta.label} size="small" color={meta.color} variant="outlined" /></TableCell>
                  <TableCell>
                    <Box sx={{ fontWeight: 500 }}>{m.product?.title ?? m.productId}</Box>
                    <Typography variant="caption" color="text.secondary">{m.product?.sku}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap', color: meta.direction === 'in' ? 'success.main' : 'error.main', fontWeight: 600 }}>
                    {meta.direction === 'in' ? '+' : '−'}{formatQty(m.quantity)} {m.product?.baseUnit?.symbol}
                  </TableCell>
                  <TableCell>{m.warehouse?.name ?? '-'}</TableCell>
                  <TableCell>{m.object?.name ?? '-'}</TableCell>
                  <TableCell>
                    {m.referenceNumber && isReceipt(m)
                      ? <Link component="button" underline="hover" onClick={() => navigate({ to: `/receipts/${m.referenceId}` })}>{m.referenceNumber}</Link>
                      : (m.referenceNumber ?? '-')}
                  </TableCell>
                  <TableCell>{userName(m)}</TableCell>
                </TableRow>
              )
            })}
            {!isLoading && (!data?.items || data.items.length === 0) && (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>Операций не найдено</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data && data.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, alignItems: 'center' }}>
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Назад</Button>
          <Typography variant="body2">{page} / {data.pages}</Typography>
          <Button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Вперёд</Button>
        </Box>
      )}
    </Box>
  )
}
