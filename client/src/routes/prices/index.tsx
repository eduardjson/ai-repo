import { useState } from 'react'
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useGetPriceListQuery, useGetWarehousesQuery } from '../../api/warehouseApi'

export function PriceListPage() {
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [manufacturerFilter, setManufacturerFilter] = useState('')
  const { data: items } = useGetPriceListQuery({ warehouseId: warehouseFilter || undefined, category: categoryFilter || undefined, manufacturer: manufacturerFilter || undefined })
  const { data: warehouses } = useGetWarehousesQuery()
  const categories = [...new Set(items?.map((i) => i.category).filter(Boolean) ?? [])]
  const manufacturers = [...new Set(items?.map((i) => i.manufacturer).filter(Boolean) ?? [])]

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Прайс-лист</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Склад</InputLabel><Select value={warehouseFilter} label="Склад" onChange={(e) => setWarehouseFilter(e.target.value)}><MenuItem value="">Все</MenuItem>{warehouses?.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Категория</InputLabel><Select value={categoryFilter} label="Категория" onChange={(e) => setCategoryFilter(e.target.value)}><MenuItem value="">Все</MenuItem>{categories.map((c) => <MenuItem key={c} value={c!}>{c}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}><InputLabel>Производитель</InputLabel><Select value={manufacturerFilter} label="Производитель" onChange={(e) => setManufacturerFilter(e.target.value)}><MenuItem value="">Все</MenuItem>{manufacturers.map((m) => <MenuItem key={m} value={m!}>{m}</MenuItem>)}</Select></FormControl>
      </Box>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Товар</TableCell><TableCell>Склад</TableCell><TableCell>Категория</TableCell><TableCell>Производитель</TableCell><TableCell align="right">Кол-во</TableCell><TableCell align="right">Закупка</TableCell><TableCell align="right">Сметная</TableCell><TableCell align="right">Продажа</TableCell><TableCell align="right">Скидка</TableCell></TableRow></TableHead>
          <TableBody>
            {items?.map((item, idx) => (
              <TableRow key={`${item.productId}-${item.warehouseId}-${idx}`} hover>
                <TableCell sx={{ fontWeight: 500 }}>{item.productTitle}</TableCell><TableCell>{item.warehouseName}</TableCell>
                <TableCell>{item.category || '-'}</TableCell><TableCell>{item.manufacturer || '-'}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell><TableCell align="right">{item.purchasePrice ?? '-'}</TableCell>
                <TableCell align="right">{item.estimatePrice ?? '-'}</TableCell><TableCell align="right">{item.salePrice ?? '-'}</TableCell>
                <TableCell align="right">{item.discount ?? '-'}</TableCell>
              </TableRow>
            ))}
            {(!items || items.length === 0) && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет данных</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
