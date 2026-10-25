import { useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, IconButton, Chip } from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { debounce } from 'lodash'
import { useProductControllerFindAllQuery, useProductControllerRemoveMutation, type ProductDto } from '../../api/generated'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setSearch, setCategory, setManufacturer, resetFilters } from '../../store/filterSlice'
import { ActionModal } from '../../components/ActionModal'

export function ProductListPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { search, category, manufacturer } = useAppSelector((s) => s.filter)
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null)
  const [localSearch, setLocalSearch] = useState(search)
  const { data, isLoading } = useProductControllerFindAllQuery({ page: String(page), size: '20', search: search || undefined, category: category || undefined, manufacturer: manufacturer || undefined })
  const [deleteProduct] = useProductControllerRemoveMutation()
  const debouncedSearch = useCallback(debounce((val: string) => dispatch(setSearch(val)), 400), [])
  const categories = [...new Set(data?.items.map((p) => p.category).filter(Boolean) ?? [])]
  const manufacturers = [...new Set(data?.items.map((p) => p.manufacturer).filter(Boolean) ?? [])]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Позиции</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate({ to: '/products/add' })}>Добавить</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Поиск..." value={localSearch} onChange={(e) => { setLocalSearch(e.target.value); debouncedSearch(e.target.value) }} sx={{ minWidth: 250 }} />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Категория</InputLabel>
          <Select value={category} label="Категория" onChange={(e) => dispatch(setCategory(e.target.value))}>
            <MenuItem value="">Все</MenuItem>
            {categories.map((c) => <MenuItem key={c!} value={c!}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Производитель</InputLabel>
          <Select value={manufacturer} label="Производитель" onChange={(e) => dispatch(setManufacturer(e.target.value))}>
            <MenuItem value="">Все</MenuItem>
            {manufacturers.map((m) => <MenuItem key={m!} value={m!}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <Button size="small" onClick={() => { dispatch(resetFilters()); setLocalSearch('') }}>Сбросить</Button>
      </Box>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Производитель</TableCell>
              <TableCell>Ед. изм.</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>Загрузка...</TableCell></TableRow>}
            {data?.items.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell sx={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate({ to: `/products/${product.id}` })}>{product.title}</TableCell>
                <TableCell>{product.category ? <Chip label={product.category} size="small" variant="outlined" /> : '-'}</TableCell>
                <TableCell>{product.manufacturer || '-'}</TableCell>
                <TableCell>{product.unit || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => navigate({ to: `/products/${product.id}` })}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(product)}><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && (!data?.items || data.items.length === 0) && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Позиции не найдены</TableCell></TableRow>}
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
      <ActionModal open={!!deleteTarget} title="Удалить позицию" message={`Вы уверены, что хотите удалить "${deleteTarget?.title}"?`} onConfirm={async () => { if (deleteTarget) { await deleteProduct({ id: deleteTarget.id }).unwrap(); setDeleteTarget(null) } }} onCancel={() => setDeleteTarget(null)} />
    </Box>
  )
}
