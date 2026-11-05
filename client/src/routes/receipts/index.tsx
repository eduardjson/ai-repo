import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, IconButton, Chip, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { Add, Visibility } from '@mui/icons-material'
import { useReceiptControllerFindAllQuery, type GoodsReceiptDto } from '../../api/generated'
import { RECEIPT_STATUS_LABELS } from '../../lib/catalog'

const statusColor: Record<string, 'success' | 'warning' | 'error'> = {
  POSTED: 'success',
  DRAFT: 'warning',
  CANCELLED: 'error',
}

export function ReceiptListPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const { data, isLoading } = useReceiptControllerFindAllQuery({ status: status || undefined })

  const items = (r: GoodsReceiptDto) => r.items?.length ?? 0

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Поступления</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate({ to: '/receipts/add' })}>Новое поступление</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Статус</InputLabel>
          <Select value={status} label="Статус" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="DRAFT">Черновик</MenuItem>
            <MenuItem value="POSTED">Проведено</MenuItem>
            <MenuItem value="CANCELLED">Отменено</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Номер</TableCell>
              <TableCell>Склад</TableCell>
              <TableCell>Поставщик</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell align="right">Позиций</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>Загрузка...</TableCell></TableRow>}
            {data?.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate({ to: `/receipts/${r.id}` })}>{r.number}</TableCell>
                <TableCell>{r.warehouse?.name ?? '-'}</TableCell>
                <TableCell>{r.supplier || '-'}</TableCell>
                <TableCell>{new Date(r.receiptDate).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell align="right">{items(r)}</TableCell>
                <TableCell><Chip label={RECEIPT_STATUS_LABELS[r.status]} size="small" color={statusColor[r.status]} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => navigate({ to: `/receipts/${r.id}` })}><Visibility fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && (!data || data.length === 0) && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет поступлений</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
