import { useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Box, Typography, Card, CardContent, CardMedia, Grid, Button, Divider, IconButton, CircularProgress } from '@mui/material'
import { Edit, Delete, ArrowBack } from '@mui/icons-material'
import { useGetProductQuery, useDeleteProductMutation } from '../../api/productApi'
import { ActionModal } from '../../components/ActionModal'

export function ProductDetailPage() {
  const params = useParams({ from: '/_private/products/$productId' })
  const productId = params.productId
  const navigate = useNavigate()
  const { data: product, isLoading } = useGetProductQuery(productId)
  const [deleteProduct] = useDeleteProductMutation()
  const [showDelete, setShowDelete] = useState(false)

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  if (!product) return <Typography>Позиция не найдена</Typography>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate({ to: '/products' })}><ArrowBack /></IconButton>
        <Typography variant="h4" fontWeight={700}>{product.title}</Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate({ to: '/products/add', search: { edit: product.id } })}>Редактировать</Button>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => setShowDelete(true)}>Удалить</Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            {(product.imageUrl || product.imageType) && (
              <CardMedia
                component="img"
                height={300}
                image={product.imageType ? `/api/products/${product.id}/image` : product.imageUrl!}
                alt={product.title}
                sx={{ objectFit: 'contain', bgcolor: 'grey.100', p: 2 }}
              />
            )}
            <CardContent>
              {product.description && <><Typography variant="subtitle2" color="text.secondary" gutterBottom>Описание</Typography><Typography variant="body1">{product.description}</Typography><Divider sx={{ my: 2 }} /></>}
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="subtitle2" color="text.secondary">Категория</Typography><Typography>{product.category || '-'}</Typography></Grid>
                <Grid size={6}><Typography variant="subtitle2" color="text.secondary">Производитель</Typography><Typography>{product.manufacturer || '-'}</Typography></Grid>
                <Grid size={6}><Typography variant="subtitle2" color="text.secondary">Ед. измерения</Typography><Typography>{product.unit || '-'}</Typography></Grid>
                <Grid size={6}><Typography variant="subtitle2" color="text.secondary">Создано</Typography><Typography>{new Date(product.createdAt).toLocaleDateString('ru-RU')}</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <ActionModal open={showDelete} title="Удалить позицию" message={`Вы уверены, что хотите удалить "${product.title}"?`} onConfirm={async () => { await deleteProduct(productId).unwrap(); navigate({ to: '/products' }) }} onCancel={() => setShowDelete(false)} />
    </Box>
  )
}
