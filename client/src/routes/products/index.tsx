import { useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  IconButton, Chip, Switch, FormControlLabel, Stack,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { debounce } from 'lodash'
import {
  useProductControllerFindAllQuery,
  useProductControllerRemoveMutation,
  useCategoryControllerFindAllQuery,
  useManufacturerControllerFindAllQuery,
  type ProductDto,
} from '../../api/generated'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setSearch, setCategoryId, setManufacturerId, resetFilters } from '../../store/filterSlice'
import { ActionModal } from '../../components/ActionModal'
import { flattenCategories, formatMoney } from '../../lib/catalog'

export function ProductListPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { search, categoryId, manufacturerId } = useAppSelector((s) => s.filter)
  const [page, setPage] = useState(1)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null)
  const [localSearch, setLocalSearch] = useState(search)

  const { data, isLoading } = useProductControllerFindAllQuery({
    page: String(page),
    size: '20',
    search: search || undefined,
    categoryId: categoryId || undefined,
    manufacturerId: manufacturerId || undefined,
    includeInactive: includeInactive ? 'true' : undefined,
  })
  const { data: categories } = useCategoryControllerFindAllQuery()
  const { data: manufacturers } = useManufacturerControllerFindAllQuery()
  const [removeProduct] = useProductControllerRemoveMutation()

  const debouncedSearch = useCallback(debounce((val: string) => dispatch(setSearch(val)), 400), [])
  const catOptions = flattenCategories(categories)

  const primaryBarcode = (p: ProductDto) => p.barcodes?.find((b) => b.isPrimary)?.value ?? '-'

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Номенклатура</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate({ to: '/products/add' })}>Новая позиция</Button>
      </Box>

      <Stack direction="row" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <TextField size="small" placeholder="Поиск: название, артикул, штрихкод..." value={localSearch}
          onChange={(e) => { setLocalSearch(e.target.value); debouncedSearch(e.target.value) }} sx={{ minWidth: 280 }} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Категория</InputLabel>
          <Select value={categoryId} label="Категория" onChange={(e) => dispatch(setCategoryId(e.target.value))}>
            <MenuItem value="">Все</MenuItem>
            {catOptions.map((c) => (
              <MenuItem key={c.id} value={c.id} sx={{ pl: 1 + c.depth * 2 }}>{c.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Производитель</InputLabel>
          <Select value={manufacturerId} label="Производитель" onChange={(e) => dispatch(setManufacturerId(e.target.value))}>
            <MenuItem value="">Все</MenuItem>
            {manufacturers?.map((m) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Switch size="small" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />}
          label="Архивные"
        />
        <Button size="small" onClick={() => { dispatch(resetFilters()); setLocalSearch('') }}>Сбросить</Button>
      </Stack>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 52 }}>Фото</TableCell>
              <TableCell>Название / Артикул</TableCell>
              <TableCell>Штрихкод</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Ед. изм.</TableCell>
              <TableCell align="right">Цена продажи</TableCell>
              <TableCell align="right">Мин. остаток</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}>Загрузка...</TableCell></TableRow>}
            {data?.items.map((product) => (
              <TableRow key={product.id} hover sx={{ opacity: product.isActive ? 1 : 0.55 }}>
                <TableCell>
                  {product.imageType || product.imageUrl ? (
                    <Box
                      component="img"
                      src={product.imageType ? `/api/products/${product.id}/image` : product.imageUrl!}
                      alt={product.title}
                      loading="lazy"
                      sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, bgcolor: 'grey.100', display: 'block' }}
                    />
                  ) : (
                    <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{product.title.charAt(0).toUpperCase()}</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ cursor: 'pointer' }} onClick={() => navigate({ to: `/products/${product.id}` })}>
                  <Box sx={{ fontWeight: 500 }}>{product.title}</Box>
                  <Typography variant="caption" color="text.secondary">{product.sku}</Typography>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{primaryBarcode(product)}</TableCell>
                <TableCell>{product.category ? <Chip label={product.category.name} size="small" variant="outlined" /> : '-'}</TableCell>
                <TableCell>{product.baseUnit?.symbol ?? '-'}</TableCell>
                <TableCell align="right">{formatMoney(product.salePrice)}</TableCell>
                <TableCell align="right">{product.minStock != null ? product.minStock : '-'}</TableCell>
                <TableCell>
                  {product.isActive
                    ? <Chip label="Активна" size="small" color="success" variant="outlined" />
                    : <Chip label="В архиве" size="small" variant="outlined" />}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => navigate({ to: `/products/${product.id}` })}><Edit fontSize="small" /></IconButton>
                  {product.isActive && (
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(product)}><Delete fontSize="small" /></IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && (!data?.items || data.items.length === 0) && (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>Позиции не найдены</TableCell></TableRow>
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

      <ActionModal
        open={!!deleteTarget}
        title="Архивировать позицию"
        message={`Позиция «${deleteTarget?.title}» будет перемещена в архив (останется в истории документов).`}
        confirmLabel="Архивировать"
        onConfirm={async () => { if (deleteTarget) { await removeProduct({ id: deleteTarget.id }).unwrap(); setDeleteTarget(null) } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
