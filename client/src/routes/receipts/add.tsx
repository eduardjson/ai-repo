import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, IconButton, TextField, Select,
  MenuItem, FormControl, InputLabel, Autocomplete, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Paper, Stack, Alert,
} from '@mui/material'
import { ArrowBack, Add, Delete, QrCodeScanner } from '@mui/icons-material'
import {
  useReceiptControllerCreateMutation,
  useWarehouseControllerFindAllQuery,
  useProductControllerFindAllQuery,
  useProductControllerFindByBarcodeQuery,
  type ProductDto,
} from '../../api/generated'
import { formatQty, formatMoney } from '../../lib/catalog'

interface Line {
  productId: string
  unitId: string
  unitQuantity: number
  purchasePrice?: number
}

export function ReceiptAddPage() {
  const navigate = useNavigate()
  const { data: warehouses } = useWarehouseControllerFindAllQuery()
  const { data: productsData } = useProductControllerFindAllQuery({ size: '100' })
  const [createReceipt, { isLoading }] = useReceiptControllerCreateMutation()

  const [warehouseId, setWarehouseId] = useState('')
  const [supplier, setSupplier] = useState('')
  const [comment, setComment] = useState('')
  const [receiptDate, setReceiptDate] = useState('')

  const [lines, setLines] = useState<Line[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null)
  const [qty, setQty] = useState('')
  const [unitId, setUnitId] = useState('')
  const [price, setPrice] = useState('')

  const [scan, setScan] = useState('')
  const [lookup, setLookup] = useState<string | null>(null)
  const { data: scanned, isError: scanError } = useProductControllerFindByBarcodeQuery(
    { value: lookup ?? '' }, { skip: !lookup },
  )

  const products = productsData?.items ?? []

  useEffect(() => {
    if (scanned) {
      setSelectedProduct(scanned)
      setLookup(null)
      setScan('')
    }
  }, [scanned])

  useEffect(() => {
    if (selectedProduct) {
      setUnitId(selectedProduct.purchaseUnitId ?? selectedProduct.baseUnitId)
    }
  }, [selectedProduct])

  const unitOptions = selectedProduct
    ? [
        { id: selectedProduct.baseUnitId, label: `${selectedProduct.baseUnit?.symbol ?? ''} — базовая` },
        ...(selectedProduct.purchaseUnitId
          ? [{ id: selectedProduct.purchaseUnitId, label: `${selectedProduct.purchaseUnit?.symbol} — закупочная` }]
          : []),
        ...(selectedProduct.saleUnitId
          ? [{ id: selectedProduct.saleUnitId, label: `${selectedProduct.saleUnit?.symbol} — продажа` }]
          : []),
      ]
    : []

  const unitSymbol = (id: string) => {
    const p = selectedProduct
    if (!p) return ''
    if (id === p.baseUnitId) return p.baseUnit?.symbol ?? ''
    if (id === p.purchaseUnitId) return p.purchaseUnit?.symbol ?? ''
    if (id === p.saleUnitId) return p.saleUnit?.symbol ?? ''
    return ''
  }

  const addLine = () => {
    if (!selectedProduct) return
    const quantity = Number(qty)
    if (!quantity || quantity <= 0) return
    setLines((ls) => [
      ...ls,
      {
        productId: selectedProduct.id,
        unitId: unitId || selectedProduct.baseUnitId,
        unitQuantity: quantity,
        purchasePrice: price ? Number(price) : undefined,
      },
    ])
    setSelectedProduct(null)
    setQty('')
    setPrice('')
    setUnitId('')
  }

  const submit = async () => {
    if (!warehouseId) return
    const result = await createReceipt({
      createReceiptDto: {
        warehouseId,
        supplier: supplier || undefined,
        comment: comment || undefined,
        receiptDate: receiptDate || undefined,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.unitQuantity,
          unitId: l.unitId,
          purchasePrice: l.purchasePrice,
        })),
      },
    }).unwrap()
    navigate({ to: `/receipts/${result.id}` })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate({ to: '/receipts' })}><ArrowBack /></IconButton>
        <Typography variant="h4" fontWeight={700}>Новое поступление</Typography>
      </Box>

      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Склад *</InputLabel>
              <Select value={warehouseId} label="Склад *" onChange={(e) => setWarehouseId(e.target.value)}>
                {warehouses?.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Поставщик" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            <TextField size="small" label="Дата" type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField size="small" label="Комментарий" value={comment} onChange={(e) => setComment(e.target.value)} />
          </Box>
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Добавить позицию</Typography>
          <Stack direction="row" gap={2} mb={2} flexWrap="wrap" alignItems="center">
            <TextField
              size="small"
              placeholder="Сканировать штрихкод..."
              value={scan}
              onChange={(e) => setScan(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setLookup(scan.trim()) } }}
              sx={{ minWidth: 260 }}
              InputProps={{ startAdornment: <QrCodeScanner color="action" sx={{ mr: 1 }} /> }}
            />
            <Button size="small" variant="outlined" onClick={() => setLookup(scan.trim())} disabled={!scan.trim()}>Найти</Button>
            {scanError && <Typography variant="caption" color="error.main">Товар не найден по штрихкоду</Typography>}
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
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
                {unitOptions.map((o) => <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Кол-во" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            <TextField size="small" label="Цена за ед." type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Button variant="contained" startIcon={<Add />} onClick={addLine} disabled={!selectedProduct || !qty}>Добавить</Button>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Позиции ({lines.length})</Typography>
          {lines.length === 0 && <Alert severity="info">Добавьте хотя бы одну позицию.</Alert>}
          {lines.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Товар</TableCell>
                    <TableCell align="right">Кол-во</TableCell>
                    <TableCell align="right">Цена за ед.</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((l, i) => {
                    const p = products.find((x) => x.id === l.productId)
                    return (
                      <TableRow key={i} hover>
                        <TableCell>
                          <Box sx={{ fontWeight: 500 }}>{p?.title ?? l.productId}</Box>
                          <Typography variant="caption" color="text.secondary">{p?.sku}</Typography>
                        </TableCell>
                        <TableCell align="right">{formatQty(l.unitQuantity)} {unitSymbol(l.unitId)}</TableCell>
                        <TableCell align="right">{formatMoney(l.purchasePrice)}</TableCell>
                        <TableCell align="right">{formatMoney(l.purchasePrice != null ? l.purchasePrice * l.unitQuantity : undefined)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="contained" size="large" onClick={submit} loading={isLoading} disabled={!warehouseId || lines.length === 0}>
          Сохранить черновик
        </Button>
        <Button variant="outlined" size="large" onClick={() => navigate({ to: '/receipts' })}>Отмена</Button>
      </Box>
    </Box>
  )
}
