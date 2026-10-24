import { useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, Typography, Card, CardContent, TextField, Button, IconButton, CircularProgress } from '@mui/material'
import { ArrowBack, CloudUpload } from '@mui/icons-material'
import { useCreateProductMutation, useGetProductQuery, useUpdateProductMutation } from '../../api/productApi'
import { useRef, useEffect, useState } from 'react'

const productSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  unit: z.string().optional(),
  imageUrl: z.string().optional(),
})
type ProductFormValues = z.infer<typeof productSchema>

export function ProductAddPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_private/products/add' })
  const editId = (search as { edit?: string })?.edit
  const isEdit = !!editId
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data: existingProduct, isLoading: isLoadingProduct } = useGetProductQuery(editId!, { skip: !isEdit })
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { title: '', description: '', category: '', manufacturer: '', unit: '', imageUrl: '' },
  })

  useEffect(() => {
    if (existingProduct) {
      reset({ title: existingProduct.title, description: existingProduct.description || '', category: existingProduct.category || '', manufacturer: existingProduct.manufacturer || '', unit: existingProduct.unit || '', imageUrl: existingProduct.imageUrl || '' })
      if (existingProduct.imageType) {
        setPreviewUrl(`/api/products/${existingProduct.id}/image`)
      }
    }
  }, [existingProduct, reset])

  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith('/api')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    if (previewUrl && !previewUrl.startsWith('/api')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(file))
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (isEdit) {
        if (selectedFile) {
          const formData = new FormData()
          Object.entries(data).forEach(([key, value]) => { if (value) formData.append(key, value) })
          formData.append('image', selectedFile)
          await updateProduct({ id: editId!, data: formData }).unwrap()
        } else {
          await updateProduct({ id: editId!, data }).unwrap()
        }
        navigate({ to: `/products/${editId}` })
      } else {
        if (selectedFile) {
          const formData = new FormData()
          Object.entries(data).forEach(([key, value]) => { if (value) formData.append(key, value) })
          formData.append('image', selectedFile)
          await createProduct(formData).unwrap()
        } else {
          await createProduct(data).unwrap()
        }
        navigate({ to: '/products' })
      }
    } catch { /* handled */ }
  }

  if (isLoadingProduct) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate({ to: '/products' })}><ArrowBack /></IconButton>
        <Typography variant="h4" fontWeight={700}>{isEdit ? 'Редактирование' : 'Новая позиция'}</Typography>
      </Box>
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField label="Название *" fullWidth {...register('title')} error={!!errors.title} helperText={errors.title?.message} />
              <TextField label="Категория" fullWidth {...register('category')} />
              <TextField label="Производитель" fullWidth {...register('manufacturer')} />
              <TextField label="Ед. измерения" fullWidth {...register('unit')} />
              <Box sx={{ gridColumn: { md: 'span 2' } }}>
                <TextField label="Описание" fullWidth multiline rows={3} {...register('description')} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" startIcon={<CloudUpload />} onClick={() => fileRef.current?.click()}>
                    {selectedFile ? 'Выбрать другой файл' : 'Загрузить изображение'}
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                  {selectedFile && <Typography variant="body2" color="text.secondary">{selectedFile.name}</Typography>}
                </Box>
                {previewUrl && (
                  <Box sx={{ width: 200, height: 200, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                )}
              </Box>
              <TextField label="URL изображения" fullWidth {...register('imageUrl')} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button type="submit" variant="contained" size="large" loading={isCreating || isUpdating}>{isEdit ? 'Сохранить' : 'Создать'}</Button>
              <Button variant="outlined" size="large" onClick={() => navigate({ to: '/products' })}>Отмена</Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
