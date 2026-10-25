import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { format } from 'date-fns'
import {
  useTransferControllerFindAllQuery,
  useTransferControllerCreateMutation,
  useWarehouseControllerFindAllQuery,
  useProductControllerFindAllQuery,
} from '../../api/generated'

export function TransferListPage() {
  const { data: transfers } = useTransferControllerFindAllQuery()
  const { data: warehouses } = useWarehouseControllerFindAllQuery()
  const { data: productsData } = useProductControllerFindAllQuery({})
  const [createTransfer, { isLoading, error }] = useTransferControllerCreateMutation()

  const [open, setOpen] = useState(false)
  const [productId, setProductId] = useState('')
  const [fromWarehouseId, setFromWarehouseId] = useState('')
  const [toWarehouseId, setToWarehouseId] = useState('')
  const [quantity, setQuantity] = useState('')

  const products = productsData?.items ?? []

  const reset = () => {
    setProductId('')
    setFromWarehouseId('')
    setToWarehouseId('')
    setQuantity('')
  }

  const handleSubmit = async () => {
    try {
      await createTransfer({
        createTransferDto: {
          productId,
          fromWarehouseId,
          toWarehouseId,
          quantity: Number(quantity),
        },
      }).unwrap()
      setOpen(false)
      reset()
    } catch {
      /* ошибка показывается в alert */
    }
  }

  const valid = Boolean(productId && fromWarehouseId && toWarehouseId && Number(quantity) > 0 && fromWarehouseId !== toWarehouseId)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Перемещения</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Новое перемещение</Button>
      </Box>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Товар</TableCell>
              <TableCell>Со склада</TableCell>
              <TableCell>На склад</TableCell>
              <TableCell align="right">Кол-во</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers?.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{format(new Date(t.createdAt), 'dd.MM.yyyy HH:mm')}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{t.product?.title ?? '-'}</TableCell>
                <TableCell>{t.fromWarehouse?.name ?? '-'}</TableCell>
                <TableCell>{t.toWarehouse?.name ?? '-'}</TableCell>
                <TableCell align="right">{t.quantity}</TableCell>
              </TableRow>
            ))}
            {(!transfers || transfers.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет перемещений</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новое перемещение</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Товар</InputLabel>
            <Select value={productId} label="Товар" onChange={(e) => setProductId(e.target.value)}>
              {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Со склада</InputLabel>
            <Select value={fromWarehouseId} label="Со склада" onChange={(e) => setFromWarehouseId(e.target.value)}>
              {warehouses?.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>На склад</InputLabel>
            <Select value={toWarehouseId} label="На склад" onChange={(e) => setToWarehouseId(e.target.value)}>
              {warehouses?.filter((w) => w.id !== fromWarehouseId).map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Количество" type="number" fullWidth value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          {error && <Alert severity="error">{(error as { data?: { message?: string } })?.data?.message || 'Ошибка перемещения'}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!valid || isLoading}>Переместить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
