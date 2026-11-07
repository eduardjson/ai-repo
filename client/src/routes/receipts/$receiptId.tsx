import { useParams, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Divider,
} from '@mui/material'
import { ArrowBack, Add, CheckCircle, Cancel, Delete } from '@mui/icons-material'
import {
  useReceiptControllerFindOneQuery,
  useReceiptControllerPostMutation,
  useReceiptControllerCancelMutation,
  useReceiptControllerRemoveMutation,
  useReceiptControllerAddItemMutation,
  useProductControllerFindAllQuery,
  type ProductDto,
} from '../../api/generated'
import { ActionModal } from '../../components/ActionModal'
import { RECEIPT_STATUS_LABELS, formatQty, formatMoney } from '../../lib/catalog'

const statusColor: Record<string, 'success' | 'warning' | 'error'> = {
  POSTED: 'success',
  DRAFT: 'warning',
  CANCELLED: 'error',
}

export function ReceiptDetailPage() {
  const params = useParams({ from: '/_private/receipts/$receiptId' })
  const receiptId = params.receiptId
  const navigate = useNavigate()
  const { data: receipt, isLoading } = useReceiptControllerFindOneQuery({ id: receiptId })
  const { data: productsData } = useProductControllerFindAllQuery({ size: '100' })
  const [post] = useReceiptControllerPostMutation()
  const [cancel] = useReceiptControllerCancelMutation()
  const [remove] = useReceiptControllerRemoveMutation()
  const [addItem] = useReceiptControllerAddItemMutation()

  const [confirmPost, setConfirmPost] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  // add-item dialog state
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null)
  const [qty, setQty] = useState('')
  const [unitId, setUnitId] = useState('')
  const [price, setPrice] = useState('')

  const products = productsData?.items ?? []

  useEffect(() => {
    if (selectedProduct) setUnitId(selectedProduct.purchaseUnitId ?? selectedProduct.baseUnitId)
  }, [selectedProduct])

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  if (!receipt) return <Typography>Поступление не найдено</Typography>

  const unitOptions = selectedProduct
    ? [
        {
          id: selectedProduct.baseUnitId,
          label: `${selectedProduct.baseUnit?.symbol ?? ''} — базовая`,
        },
        ...(selectedProduct.purchaseUnitId
          ? [
              {
                id: selectedProduct.purchaseUnitId,
                label: `${selectedProduct.purchaseUnit?.symbol} — закупочная`,
              },
            ]
          : []),
        ...(selectedProduct.saleUnitId
          ? [
              {
                id: selectedProduct.saleUnitId,
                label: `${selectedProduct.saleUnit?.symbol} — продажа`,
              },
            ]
          : []),
      ]
    : []

  const isDraft = receipt.status === 'DRAFT'
  const isPosted = receipt.status === 'POSTED'

  const totalSum =
    receipt.items?.reduce((s, i) => s + (i.purchasePrice ?? 0) * i.unitQuantity, 0) ?? 0

  const submitAddItem = async () => {
    if (!selectedProduct || !qty) return
    await addItem({
      id: receiptId,
      addReceiptItemDto: {
        productId: selectedProduct.id,
        quantity: Number(qty),
        unitId: unitId || selectedProduct.baseUnitId,
        purchasePrice: price ? Number(price) : undefined,
      },
    }).unwrap()
    setAddOpen(false)
    setSelectedProduct(null)
    setQty('')
    setPrice('')
    setUnitId('')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate({ to: '/receipts' })}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          {receipt.number}
        </Typography>
        <Chip label={RECEIPT_STATUS_LABELS[receipt.status]} color={statusColor[receipt.status]} />
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          {isDraft && (
            <>
              <Button variant="outlined" startIcon={<Add />} onClick={() => setAddOpen(true)}>
                Добавить позицию
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => setConfirmPost(true)}
              >
                Провести
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setConfirmRemove(true)}
              >
                Удалить
              </Button>
            </>
          )}
          {isPosted && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setConfirmCancel(true)}
            >
              Отменить
            </Button>
          )}
          {receipt.status === 'CANCELLED' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setConfirmRemove(true)}
            >
              Удалить
            </Button>
          )}
        </Box>
      </Box>

      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Склад
              </Typography>
              <Typography>{receipt.warehouse?.name ?? '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Поставщик
              </Typography>
              <Typography>{receipt.supplier || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Дата
              </Typography>
              <Typography>{new Date(receipt.receiptDate).toLocaleString('ru-RU')}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Автор
              </Typography>
              <Typography>{receipt.createdBy?.email ?? '-'}</Typography>
            </Box>
          </Box>
          {receipt.comment && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">{receipt.comment}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Позиции
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Товар</TableCell>
                  <TableCell align="right">Принято</TableCell>
                  <TableCell align="right">В базовых ед.</TableCell>
                  <TableCell align="right">Цена за ед.</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipt.items?.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ fontWeight: 500 }}>{item.product?.title ?? item.productId}</Box>
                      <Typography variant="caption" color="text.secondary">
                        {item.product?.sku}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatQty(item.unitQuantity)} {item.unit?.symbol}
                    </TableCell>
                    <TableCell align="right">
                      {formatQty(item.quantity)} {item.product?.baseUnit?.symbol}
                    </TableCell>
                    <TableCell align="right">{formatMoney(item.purchasePrice)}</TableCell>
                    <TableCell align="right">
                      {formatMoney(
                        item.purchasePrice != null
                          ? item.purchasePrice * item.unitQuantity
                          : undefined,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!receipt.items || receipt.items.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Нет позиций
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {receipt.items && receipt.items.length > 0 && (
            <Typography variant="subtitle1" sx={{ mt: 2, textAlign: 'right' }}>
              Итого: {formatMoney(totalSum)}
            </Typography>
          )}
        </CardContent>
      </Card>

      <ActionModal
        open={confirmPost}
        title="Провести поступление"
        message="Товары будут оприходованы на склад (увеличат остатки). Действие обратимо через отмену."
        confirmLabel="Провести"
        onConfirm={async () => {
          await post({ id: receiptId }).unwrap()
          setConfirmPost(false)
        }}
        onCancel={() => setConfirmPost(false)}
      />
      <ActionModal
        open={confirmCancel}
        title="Отменить поступление"
        message="Остатки на складе будут уменьшены обратно."
        confirmLabel="Отменить"
        onConfirm={async () => {
          await cancel({ id: receiptId }).unwrap()
          setConfirmCancel(false)
        }}
        onCancel={() => setConfirmCancel(false)}
      />
      <ActionModal
        open={confirmRemove}
        title="Удалить поступление"
        message={`Документ «${receipt.number}» будет удалён безвозвратно.`}
        confirmLabel="Удалить"
        onConfirm={async () => {
          await remove({ id: receiptId }).unwrap()
          navigate({ to: '/receipts' })
        }}
        onCancel={() => setConfirmRemove(false)}
      />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить позицию</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            size="small"
            options={products}
            getOptionLabel={(p) => `${p.title} (${p.sku})`}
            value={selectedProduct}
            onChange={(_, v) => setSelectedProduct(v)}
            renderInput={(params) => <TextField {...params} label="Товар" />}
            isOptionEqualToValue={(o, v) => o.id === v.id}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Единица</InputLabel>
            <Select value={unitId} label="Единица" onChange={(e) => setUnitId(e.target.value)}>
              {unitOptions.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Кол-во"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <TextField
            size="small"
            label="Цена за ед."
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={submitAddItem} disabled={!selectedProduct || !qty}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
