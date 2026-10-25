import { useState } from 'react'
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Tooltip,
  Divider, CircularProgress,
} from '@mui/material'
import { Add, Delete, Visibility } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useShipmentControllerFindAllQuery,
  useShipmentControllerCreateMutation,
  useShipmentControllerUpdateStatusMutation,
  useShipmentControllerRemoveMutation,
  useWarehouseControllerFindAllQuery,
  useObjectControllerFindAllQuery,
  useProductControllerFindAllQuery,
  type ShipmentDto,
} from '../../api/generated'
import { ActionModal } from '../../components/ActionModal'

const STATUS_LABELS: Record<string, string> = { PENDING: 'Ожидает', COMPLETED: 'Завершена', CANCELLED: 'Отменена' }
const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error'> = { PENDING: 'warning', COMPLETED: 'success', CANCELLED: 'error' }
const shipmentSchema = z.object({ warehouseId: z.string().min(1, 'Выберите склад'), objectId: z.string().min(1, 'Выберите объект') })
type ShipmentFormValues = z.infer<typeof shipmentSchema>
interface ItemEntry { productId: string; quantity: number }

export function ShipmentListPage() {
  const [objectFilter, setObjectFilter] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const { data: shipments, isLoading } = useShipmentControllerFindAllQuery({ objectId: objectFilter || undefined, warehouseId: warehouseFilter || undefined })
  const { data: warehouses } = useWarehouseControllerFindAllQuery()
  const { data: objects } = useObjectControllerFindAllQuery()
  const { data: productsData } = useProductControllerFindAllQuery({})
  const [createShipment, { isLoading: creating, error: createError }] = useShipmentControllerCreateMutation()
  const [updateStatus] = useShipmentControllerUpdateStatusMutation()
  const [deleteShipment] = useShipmentControllerRemoveMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [items, setItems] = useState<ItemEntry[]>([])
  const [detailTarget, setDetailTarget] = useState<ShipmentDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ShipmentDto | null>(null)
  const { register, handleSubmit: handleShSubmit, reset, formState: { errors } } = useForm<ShipmentFormValues>({ resolver: zodResolver(shipmentSchema) })

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }])
  const updateItem = (index: number, field: keyof ItemEntry, value: string | number) => {
    const newItems = [...items]; newItems[index] = { ...newItems[index], [field]: value }; setItems(newItems)
  }
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))

  const onCreate = async (d: ShipmentFormValues) => {
    await createShipment({ createShipmentDto: { warehouseId: d.warehouseId, objectId: d.objectId, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) } }).unwrap()
    setDialogOpen(false); setItems([]); reset()
  }

  const products = productsData?.items ?? []
  const createErrorMsg = (createError as { data?: { message?: string } })?.data?.message

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Отгрузки</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Новая отгрузка</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}><InputLabel>Объект</InputLabel><Select value={objectFilter} label="Объект" onChange={(e) => setObjectFilter(e.target.value)}><MenuItem value="">Все</MenuItem>{objects?.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}><InputLabel>Склад</InputLabel><Select value={warehouseFilter} label="Склад" onChange={(e) => setWarehouseFilter(e.target.value)}><MenuItem value="">Все</MenuItem>{warehouses?.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}</Select></FormControl>
      </Box>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Склад</TableCell><TableCell>Объект</TableCell><TableCell>Статус</TableCell><TableCell>Позиций</TableCell><TableCell>Дата</TableCell><TableCell align="right">Действия</TableCell></TableRow></TableHead>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>}
            {shipments?.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.warehouse?.name ?? '-'}</TableCell>
                <TableCell>{s.object?.name ?? '-'}</TableCell>
                <TableCell><Chip label={STATUS_LABELS[s.status] || s.status} size="small" color={STATUS_COLORS[s.status] || 'default'} /></TableCell>
                <TableCell>{s.items?.length ?? 0}</TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Просмотр"><IconButton size="small" onClick={() => setDetailTarget(s)}><Visibility fontSize="small" /></IconButton></Tooltip>
                  {s.status === 'PENDING' && (
                    <>
                      <Button size="small" color="success" variant="outlined" sx={{ mr: 0.5, ml: 0.5 }} onClick={() => updateStatus({ id: s.id, updateStatusDto: { status: 'COMPLETED' } })}>Завершить</Button>
                      <Button size="small" color="error" variant="outlined" sx={{ mr: 0.5 }} onClick={() => updateStatus({ id: s.id, updateStatusDto: { status: 'CANCELLED' } })}>Отменить</Button>
                    </>
                  )}
                  <Tooltip title="Удалить"><IconButton size="small" color="error" onClick={() => setDeleteTarget(s)}><Delete fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && (!shipments || shipments.length === 0) && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет отгрузок</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleShSubmit(onCreate)}>
          <DialogTitle>Новая отгрузка</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth error={!!errors.warehouseId}>
              <InputLabel>Склад</InputLabel>
              <Select label="Склад" {...register('warehouseId')} defaultValue="">
                <MenuItem value="">Выберите склад</MenuItem>
                {warehouses?.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth error={!!errors.objectId}>
              <InputLabel>Объект</InputLabel>
              <Select label="Объект" {...register('objectId')} defaultValue="">
                <MenuItem value="">Выберите объект</MenuItem>
                {objects?.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Товары</Typography>
            {items.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Select value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} size="small" sx={{ flex: 1 }} displayEmpty>
                  <MenuItem value="">Выберите товар</MenuItem>
                  {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
                </Select>
                <TextField label="Кол-во" type="number" size="small" sx={{ width: 100 }} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                <IconButton size="small" color="error" onClick={() => removeItem(i)}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<Add />} onClick={addItem}>Добавить товар</Button>
            {createErrorMsg && <Typography variant="body2" color="error">{createErrorMsg}</Typography>}
          </DialogContent>
          <DialogActions><Button onClick={() => { setDialogOpen(false); setItems([]) }}>Отмена</Button><Button type="submit" variant="contained" disabled={creating}>Создать</Button></DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!detailTarget} onClose={() => setDetailTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Отгрузка</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {detailTarget && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Склад</Typography>
                <Typography variant="body2">{detailTarget.warehouse?.name ?? '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Объект</Typography>
                <Typography variant="body2">{detailTarget.object?.name ?? '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Статус</Typography>
                <Chip label={STATUS_LABELS[detailTarget.status] || detailTarget.status} size="small" color={STATUS_COLORS[detailTarget.status] || 'default'} />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Позиции</Typography>
              <Table size="small">
                <TableHead><TableRow><TableCell>Товар</TableCell><TableCell align="right">Кол-во</TableCell></TableRow></TableHead>
                <TableBody>
                  {detailTarget.items?.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>{it.product?.title ?? '-'}</TableCell>
                      <TableCell align="right">{it.quantity}</TableCell>
                    </TableRow>
                  ))}
                  {(!detailTarget.items || detailTarget.items.length === 0) && <TableRow><TableCell colSpan={2} align="center" sx={{ py: 2, color: 'text.secondary' }}>Нет позиций</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setDetailTarget(null)}>Закрыть</Button></DialogActions>
      </Dialog>

      <ActionModal open={!!deleteTarget} title="Удалить отгрузку" message={`Удалить отгрузку на объект «${deleteTarget?.object?.name ?? ''}»? Остатки будут возвращены на склад.`} onConfirm={async () => { if (deleteTarget) { await deleteShipment({ id: deleteTarget.id }).unwrap(); setDeleteTarget(null) } }} onCancel={() => setDeleteTarget(null)} />
    </Box>
  )
}
