'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, Save, Package, Star, StarOff, Upload, ImageIcon, FolderPlus, Folder, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Category {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  _count?: { products: number }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  categoryId: string
  stock: number
  featured: boolean
}

interface AdminPanelProps {
  onProductChange: () => void
}

export function AdminPanel({ onProductChange }: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    stock: '',
    featured: false
  })
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  })

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchProducts()
      await fetchCategories()
    }
    
    loadInitialData()
  }, [])
  
  // === PRODUCTS ===
  const handleOpenNewProduct = () => {
    setEditProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      categoryId: categories[0]?.id || '',
      stock: '',
      featured: false
    })
    setImagePreview('')
    setIsProductDialogOpen(true)
  }
  
  const handleOpenEditProduct = (product: Product) => {
    setEditProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      featured: product.featured
    })
    setImagePreview(product.imageUrl)
    setIsProductDialogOpen(true)
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    
    try {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setImagePreview(base64)
        setFormData(prev => ({ ...prev, imageUrl: base64 }))
        setIsUploading(false)
      }
      reader.onerror = () => {
        alert('Error al leer el archivo')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      setIsUploading(false)
    }
  }
  
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.imageUrl) {
      alert('Por favor añade una imagen al producto')
      return
    }
    
    if (!formData.categoryId) {
      alert('Por favor selecciona una categoría')
      return
    }
    
    const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
    const method = editProduct ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setIsProductDialogOpen(false)
        fetchProducts()
        onProductChange()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }
  
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        fetchProducts()
        onProductChange()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }
  
  const toggleFeatured = async (product: Product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          featured: !product.featured
        })
      })
      fetchProducts()
      onProductChange()
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }
  
  // === CATEGORIES ===
  const handleOpenNewCategory = () => {
    setEditCategory(null)
    setCategoryForm({
      name: '',
      description: ''
    })
    setIsCategoryDialogOpen(true)
  }
  
  const handleOpenEditCategory = (category: Category) => {
    setEditCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || ''
    })
    setIsCategoryDialogOpen(true)
  }
  
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryForm.name.trim()) {
      alert('El nombre de la categoría es requerido')
      return
    }
    
    const url = editCategory ? `/api/categories/${editCategory.id}` : '/api/categories'
    const method = editCategory ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })
      
      if (res.ok) {
        setIsCategoryDialogOpen(false)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }
  
  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id)
    if (category?._count?.products && category._count.products > 0) {
      alert(`No se puede eliminar. Esta categoría tiene ${category._count.products} productos.`)
      return
    }
    
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
    
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }
  
  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="bg-muted/30 border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
            <Package className="h-5 w-5 text-[var(--gold)]" />
          </div>
          Panel de Administración
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full rounded-none border-b border-border/50 bg-muted/20 h-12">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Categorías
            </TabsTrigger>
          </TabsList>
          
          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="m-0">
            <div className="p-4 border-b border-border/50 flex justify-end">
              <Button 
                onClick={handleOpenNewProduct}
                className="rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-12 h-12 mx-auto rounded-full border-2 border-[var(--gold)] border-t-transparent animate-spin" />
                <p className="mt-4">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>No hay productos. ¡Añade el primero!</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16">Imagen</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Destacado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="group">
                        <TableCell>
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[var(--gold)]/30">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={product.stock > 0 ? 'default' : 'destructive'}
                            className={product.stock > 0 ? 'bg-green-600' : ''}
                          >
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-[var(--gold)]/10"
                            onClick={() => toggleFeatured(product)}
                          >
                            {product.featured ? (
                              <Star className="h-5 w-5 text-[var(--gold)] fill-[var(--gold)]" />
                            ) : (
                              <StarOff className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
                              onClick={() => handleOpenEditProduct(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </TabsContent>
          
          {/* CATEGORIES TAB */}
          <TabsContent value="categories" className="m-0">
            <div className="p-4 border-b border-border/50 flex justify-end">
              <Button 
                onClick={handleOpenNewCategory}
                className="rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Nueva Categoría
              </Button>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Folder className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>No hay categorías. ¡Crea la primera!</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-center">Productos</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.description || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {category._count?.products || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
                              onClick={() => handleOpenEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={(category._count?.products || 0) > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* PRODUCT DIALOG */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-5 mt-4">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Imagen del Producto</Label>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-48 h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    {isUploading ? 'Procesando...' : 'Subir Imagen desde Dispositivo'}
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  <div className="text-center text-xs text-muted-foreground">
                    <p>O pega una URL de imagen:</p>
                  </div>
                  
                  <Input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, imageUrl: e.target.value }))
                      setImagePreview(e.target.value)
                    }}
                    className="h-12"
                  />
                  
                  <p className="text-xs text-muted-foreground">
                    Formatos: JPG, PNG, WebP. Máximo 5MB
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="resize-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="price">Precio ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <Label htmlFor="featured" className="font-medium">Producto Destacado</Label>
                <p className="text-sm text-muted-foreground">Se mostrará en la sección principal</p>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
                disabled={isUploading}
              >
                <Save className="mr-2 h-4 w-4" />
                {editProduct ? 'Actualizar Producto' : 'Guardar Producto'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full px-8"
                onClick={() => setIsProductDialogOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* CATEGORY DIALOG */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nombre de la Categoría</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="h-12"
                placeholder="Ej: Bolso de Mano"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Descripción (opcional)</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                rows={3}
                className="resize-none"
                placeholder="Descripción breve de la categoría"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-full bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
              >
                <Save className="mr-2 h-4 w-4" />
                {editCategory ? 'Actualizar' : 'Guardar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full px-8"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
