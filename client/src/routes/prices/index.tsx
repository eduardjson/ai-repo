import { useState } from 'react'
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  FormControl, InputLabel, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button, Tooltip,
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useGetPriceListQuery, useGetWarehousesQuery, useUpdateStockMutation } from '../../api/warehouseApi'
import type { PriceListItemDto } from '@shared/types'

export function PriceListPage() {
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [manufacturerFilter, setManufacturerFilter] = useState('')
  const { data: items } = useGetPriceListQuery(warehouseFilter ? { warehouseId: warehouseFilter } : undefined)
  const { data: warehouses } = useGetWarehousesQuery()
  const [updateStock] = useUpdateStockMutation()

  const [editTarget, setEditTarget] = useState<PriceListItemDto | null>(null)
  const [purchase, setPurchase] = useState('')
  const [estimate, setEstimate] = useState('')
  const [sale, setSale] = useState('')
  const [discount, setDiscount] = useState('')

  const openEdit = (item: PriceListItemDto) => {
    setEditTarget(item)
    setPurchase(item.purchasePrice?.toString() ?? '')
    setEstimate(item.estimatePrice?.toString() ?? '')
    setSale(item.salePrice?.toString() ?? '')
    setDiscount(item.discount?.toString() ?? '')
  }

  const saveEdit = async () => {
    if (!editTarget) return
    await updateStock({
      warehouseId: editTarget.warehouseId,
      stockId: editTarget.id,
      data: {
        purchasePrice: purchase === '' ? undefined : Number(purchase),
        estimatePrice: estimate === '' ? undefined : Number(estimate),
        salePrice: sale === '' ? undefined : Number(sale),
        discount: discount === '' ? undefined : Number(discount),
      },
    }).unwrap()
    setEditTarget(null)
  }

  const categories = [...new Set(items?.map((i) => i.category).filter(Boolean) ?? [])]
  const manufacturers = [...new Set(items?.map((i) => i.manufacturer).filter(Boolean) ?? [])]

  const filteredItems = (items ?? []).filter(
    (i) => (!categoryFilter || i.category === categoryFilter) && (!manufacturerFilter || i.manufacturer === manufacturerFilter),
  )

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Прайс-лист</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Склад</InputLabel><Select value={warehouseFilter} label="Склад" onChange={(e) => setWarehouseFilter(e.target.value)}><MenuItem value="">Все</MenuItem>{warehouses?.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Категория</InputLabel><Select value={categoryFilter} label="Категория" onChange={(e) => setCategoryFilter(e.target.value)}><MenuItem value="">Все</MenuItem>{categories.map((c) => <MenuItem key={c} value={c!}>{c}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}><InputLabel>Производитель</InputLabel><Select value={manufacturerFilter} label="Производитель" onChange={(e) => setManufacturerFilter(e.target.value)}><MenuItem value="">Все</MenuItem>{manufacturers.map((m) => <MenuItem key={m} value={m!}>{m}</MenuItem>)}</Select></FormControl>
      </Box>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Товар</TableCell><TableCell>Склад</TableCell><TableCell>Категория</TableCell>
              <TableCell>Производитель</TableCell><TableCell align="right">Кол-во</TableCell>
              <TableCell align="right">Закупка</TableCell><TableCell align="right">Сметная</TableCell>
              <TableCell align="right">Продажа</TableCell><TableCell align="right">Скидка</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{item.productTitle}</TableCell>
                <TableCell>{item.warehouseName}</TableCell>
                <TableCell>{item.category || '-'}</TableCell>
                <TableCell>{item.manufacturer || '-'}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{item.purchasePrice ?? '-'}</TableCell>
                <TableCell align="right">{item.estimatePrice ?? '-'}</TableCell>
                <TableCell align="right">{item.salePrice ?? '-'}</TableCell>
                <TableCell align="right">{item.discount ?? '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Изменить цены"><IconButton size="small" onClick={() => openEdit(item)}><Edit fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет данных</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Изменить цены — {editTarget?.productTitle}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Закупочная цена" type="number" fullWidth value={purchase} onChange={(e) => setPurchase(e.target.value)} />
          <TextField label="Сметная цена" type="number" fullWidth value={estimate} onChange={(e) => setEstimate(e.target.value)} />
          <TextField label="Цена продажи" type="number" fullWidth value={sale} onChange={(e) => setSale(e.target.value)} />
          <TextField label="Скидка, %" type="number" fullWidth value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </DialogContent>
        <DialogActions><Button onClick={() => setEditTarget(null)}>Отмена</Button><Button variant="contained" onClick={saveEdit}>Сохранить</Button></DialogActions>
      </Dialog>
    </Box>
  )
}
