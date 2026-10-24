import { useState } from 'react'
import { Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { Add, Edit, Delete, Inventory } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetWarehousesQuery, useCreateWarehouseMutation, useUpdateWarehouseMutation, useDeleteWarehouseMutation, useAddStockMutation } from '../../api/warehouseApi'
import { useGetProductsQuery } from '../../api/productApi'
import { ActionModal } from '../../components/ActionModal'
import type { WarehouseDto } from '@shared/types'

const warehouseSchema = z.object({ name: z.string().min(1, 'Название обязательно'), address: z.string().optional() })
type WarehouseFormValues = z.infer<typeof warehouseSchema>
const stockSchema = z.object({ productId: z.string().min(1, 'Выберите товар'), quantity: z.string().min(1, 'Количество > 0'), purchasePrice: z.string().optional(), estimatePrice: z.string().optional(), salePrice: z.string().optional(), discount: z.string().optional() })
type StockFormValues = z.infer<typeof stockSchema>

export function WarehouseListPage() {
  const { data: warehouses } = useGetWarehousesQuery()
  const { data: products } = useGetProductsQuery({})
  const [createWarehouse] = useCreateWarehouseMutation()
  const [updateWarehouse] = useUpdateWarehouseMutation()
  const [deleteWarehouse] = useDeleteWarehouseMutation()
  const [addStock] = useAddStockMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WarehouseDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WarehouseDto | null>(null)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [stockWarehouseId, setStockWarehouseId] = useState<string | null>(null)

  const { register, handleSubmit: handleWhSubmit, reset, formState: { errors } } = useForm<WarehouseFormValues>({ resolver: zodResolver(warehouseSchema) })
  const { register: regStock, handleSubmit: handleStSubmit, reset: resetStock, formState: { errors: stockErrors } } = useForm<StockFormValues>({ resolver: zodResolver(stockSchema) })

  const openCreate = () => { setEditTarget(null); reset({ name: '', address: '' }); setDialogOpen(true) }
  const openEdit = (w: WarehouseDto) => { setEditTarget(w); reset({ name: w.name, address: w.address || '' }); setDialogOpen(true) }

  const onWhSubmit = async (data: WarehouseFormValues) => {
    if (editTarget) { await updateWarehouse({ id: editTarget.id, data }).unwrap() }
    else { await createWarehouse(data).unwrap() }
    setDialogOpen(false)
  }

  const onStSubmit = async (data: StockFormValues) => {
    if (!stockWarehouseId) return
    await addStock({
      warehouseId: stockWarehouseId,
      data: {
        productId: data.productId,
        quantity: Number(data.quantity),
        purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : undefined,
        estimatePrice: data.estimatePrice ? Number(data.estimatePrice) : undefined,
        salePrice: data.salePrice ? Number(data.salePrice) : undefined,
        discount: data.discount ? Number(data.discount) : undefined,
      },
    }).unwrap()
    setStockDialogOpen(false)
    resetStock()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Склады</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Добавить склад</Button>
      </Box>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Название</TableCell><TableCell>Адрес</TableCell><TableCell align="right">Действия</TableCell></TableRow></TableHead>
          <TableBody>
            {warehouses?.map((w) => (
              <TableRow key={w.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{w.name}</TableCell>
                <TableCell>{w.address || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setStockWarehouseId(w.id); setStockDialogOpen(true); resetStock({ productId: '', quantity: '0' }) }}><Inventory fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => openEdit(w)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(w)}><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!warehouses || warehouses.length === 0) && <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>Нет складов</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleWhSubmit(onWhSubmit)}>
          <DialogTitle>{editTarget ? 'Редактировать склад' : 'Новый склад'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Название" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField label="Адрес" fullWidth {...register('address')} />
          </DialogContent>
          <DialogActions><Button onClick={() => setDialogOpen(false)}>Отмена</Button><Button type="submit" variant="contained">Сохранить</Button></DialogActions>
        </form>
      </Dialog>

      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleStSubmit(onStSubmit)}>
          <DialogTitle>Добавить товар на склад</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Товар" fullWidth {...regStock('productId')} error={!!stockErrors.productId} helperText={stockErrors.productId?.message} SelectProps={{ native: true }}>
              <option value="">Выберите товар</option>
              {products?.items?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </TextField>
            <TextField label="Количество" type="number" fullWidth {...regStock('quantity')} error={!!stockErrors.quantity} helperText={stockErrors.quantity?.message} />
            <TextField label="Цена закупки" type="number" fullWidth {...regStock('purchasePrice')} />
            <TextField label="Сметная цена" type="number" fullWidth {...regStock('estimatePrice')} />
            <TextField label="Цена продажи" type="number" fullWidth {...regStock('salePrice')} />
            <TextField label="Скидка" type="number" fullWidth {...regStock('discount')} />
          </DialogContent>
          <DialogActions><Button onClick={() => setStockDialogOpen(false)}>Отмена</Button><Button type="submit" variant="contained">Добавить</Button></DialogActions>
        </form>
      </Dialog>

      <ActionModal open={!!deleteTarget} title="Удалить склад" message={`Удалить "${deleteTarget?.name}"?`} onConfirm={async () => { if (deleteTarget) { await deleteWarehouse(deleteTarget.id).unwrap(); setDeleteTarget(null) } }} onCancel={() => setDeleteTarget(null)} />
    </Box>
  )
}
