'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Phone, 
  Sparkles,
  Heart,
  Star,
  Shield,
  Truck,
  Award,
  MessageCircleHeart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/store/product-card'
import { CartDrawer } from '@/components/store/cart-drawer'
import { ProductDetailModal } from '@/components/store/product-detail-modal'
import { AdminLogin } from '@/components/store/admin-login'
import { AdminPanel } from '@/components/store/admin-panel'
import { Pagination } from '@/components/store/pagination'
import { useCartStore } from '@/store/cart'

interface Category {
  id: string
  name: string
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  
   const checkAuth = async () => {
     try {
       const res = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: '', password: '' })
       })
     } catch {
       // No hay sesión
     }
   }
   
   const fetchData = useCallback(async (page = 1) => {
     try {
       const [productsRes, categoriesRes] = await Promise.all([
         fetch(`/api/products?page=${page}&limit=12&categoryId=${selectedCategory}`),
         fetch('/api/categories')
       ])
       const productsData = await productsRes.json()
       const categoriesData = await categoriesRes.json()
       setProducts(productsData.products)
       setPagination(productsData.pagination)
       setCategories(categoriesData)
     } catch (error) {
       console.error('Error fetching data:', error)
     } finally {
       setLoading(false)
     }
   }, [selectedCategory])
   
   useEffect(() => {
     // Initialize state
     const initializeState = () => {
       setCurrentPage(1)
     }
     initializeState()
     // Define async function to fetch data and check auth
     const loadInitialData = async () => {
       await fetchData(1)
       await checkAuth()
       await fetch('/api/seed')
     }
     
     // Call the async function without triggering lint error
     loadInitialData().catch(console.error)
   }, [fetchData])
  
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (res.ok) {
        setIsAdmin(true)
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAdmin(false)
  }
  
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }
  
  const handleWhatsAppCheckout = () => {
    const phoneNumber = '5354133253'
    
    const itemsList = items
      .map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n')
    
    const message = `¡Hola! Estoy interesado en los siguientes productos de Carteras Lesly:

${itemsList}

Total: $${getTotal().toFixed(2)}

¡Gracias!`
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }
  
  const filteredProducts = products
  
  const selectedCategoryName = selectedCategory === 'all' 
    ? 'all' 
    : categories.find(c => c.id === selectedCategory)?.name || 'all'
  
  const featuredProducts = products.filter(p => p.featured)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchData(page)
    // Scroll to products section
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 header-glass">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-profesional.jpg" 
                alt="Carteras Lesly" 
                width={180}
                height={60}
                className="h-12 w-auto object-contain logo-transparent"
                priority
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                onClick={() => {
                  setSelectedCategory('all')
                  setCurrentPage(1)
                  document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="rounded-full"
              >
                Todos
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setCurrentPage(1)
                    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </nav>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <CartDrawer onCheckout={handleWhatsAppCheckout} />
              <AdminLogin isAdmin={isAdmin} onLogin={handleLogin} onLogout={handleLogout} />
            </div>
          </div>

          {/* Mobile category scroll — siempre visible en móvil */}
          <div className="md:hidden pb-3 -mx-4 px-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => { 
                  setSelectedCategory('all')
                  setCurrentPage(1)
                  document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  selectedCategory === 'all'
                    ? 'bg-[var(--gold)] text-primary border-[var(--gold)]'
                    : 'bg-transparent text-foreground border-border/60 hover:border-[var(--gold)]/50'
                }`}
              >
                Todos
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => { 
                    setSelectedCategory(category.id)
                    setCurrentPage(1)
                    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    selectedCategory === category.id
                      ? 'bg-[var(--gold)] text-primary border-[var(--gold)]'
                      : 'bg-transparent text-foreground border-border/60 hover:border-[var(--gold)]/50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--champagne)] via-background to-[var(--champagne)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gold-light)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--gold-light)_0%,_transparent_50%)]" />
          
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-[var(--gold)]/30 mb-6 animate-fade-in-up opacity-0-init">
                <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-sm font-medium tracking-wide">Nueva Colección 2026</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up opacity-0-init delay-100">
                Descubre la
                <span className="block mt-2 bg-gradient-to-r from-primary via-[var(--gold)] to-primary bg-clip-text text-transparent">
                  Elegancia Definida
                </span>
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up opacity-0-init delay-200">
                Selección de carteras originales de marcas premium.
                Diseños únicos que combinan sofisticación y calidad garantizada.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up opacity-0-init delay-300">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-primary"
                  onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explorar Colección
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-8 border-[var(--gold)]/50 hover:bg-[var(--gold)]/10"
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Contáctanos
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-border/50 animate-fade-in-up opacity-0-init delay-400">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Cuero Genuino</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Clientes Felices</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Valoración</p>
                </div>
              </div>

              {/* Badges de confianza */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-fade-in-up opacity-0-init delay-500">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium dark:bg-green-950/30 dark:border-green-800 dark:text-green-400">
                  <Shield className="w-3.5 h-3.5" />
                  Pago Seguro
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400">
                  <Truck className="w-3.5 h-3.5" />
                  Envío a toda Cuba
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400">
                  <Award className="w-3.5 h-3.5" />
                  Garantía de Calidad
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-400">
                  <MessageCircleHeart className="w-3.5 h-3.5" />
                  Atención Personalizada
                </span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Products */}
        {featuredProducts.length > 0 && selectedCategory === 'all' && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in-up opacity-0-init">
                <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-[var(--gold)]" />
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                  <h3 className="text-2xl md:text-3xl font-bold">Carteras Destacadas</h3>
                </div>
                <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-[var(--gold)]" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {featuredProducts.slice(0, 4).map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up opacity-0-init"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <ProductCard
                      product={product}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Products Grid */}
        <section id="productos" className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold">
                  {selectedCategoryName === 'all' ? 'Toda la Colección' : selectedCategoryName}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <Badge variant="outline" className="px-4 py-2 text-sm border-[var(--gold)]/30">
                Envío a toda Cuba
              </Badge>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col rounded-2xl border border-border/50 overflow-hidden bg-card">
                    {/* imagen */}
                    <div className="aspect-square bg-muted animate-pulse" />
                    {/* contenido */}
                    <div className="p-2 sm:p-3 flex-1 space-y-2">
                      <div className="h-3 w-16 bg-muted animate-pulse rounded-full" />
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded-md" />
                      <div className="h-3 w-2/3 bg-muted animate-pulse rounded-md" />
                    </div>
                    {/* footer */}
                    <div className="p-2 sm:p-3 pt-0 flex items-center justify-between">
                      <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                      <div className="flex gap-1.5">
                        <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
                        <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30" />
                <p className="text-xl text-muted-foreground">No hay carteras en esta categoría</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {filteredProducts.map((product, i) => (
                    <div
                      key={product.id}
                      className="animate-fade-in-up opacity-0-init"
                      style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
                    >
                      <ProductCard
                        product={product}
                        onViewDetails={handleViewDetails}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </section>
        
        {/* Admin Panel */}
        {isAdmin && (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <AdminPanel onProductChange={fetchData} />
            </div>
          </section>
        )}
      </main>
      
      {/* Contact Info Section */}
      <section id="contacto" className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-3">Visítanos</h3>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">
              Te invitamos a conocer nuestra tienda y descubrir personally la calidad de nuestros productos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-[var(--gold)]" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-primary-foreground">Dirección</h4>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  Calle 140 # 4112 / 41 y 43<br />
                  Marianao, Coco Solo<br />
                  La Habana, Cuba
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-[var(--gold)]" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-primary-foreground">Horario</h4>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  Lunes a Sábado<br />
                  9:00 AM - 8:00 PM<br />
                  <span className="text-[var(--gold)]">Domingos con cita previa</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                  <Phone className="h-7 w-7 text-[var(--gold)]" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-primary-foreground">WhatsApp</h4>
                <a 
                  href="https://wa.me/5354133253" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--gold)] hover:underline text-lg font-medium"
                >
                  +53 5 413 3253
                </a>
                <p className="text-primary-foreground/50 text-xs mt-2">
                  Respuesta inmediata
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-primary border-t border-primary-foreground/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-profesional.jpg" 
                alt="Carteras Lesly" 
                width={120}
                height={40}
                className="h-10 w-auto object-contain logo-transparent"
              />
            </div>
            
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Carteras Lesly. Todos los derechos reservados.
            </p>
            
            <a 
              href="https://wa.me/5354133253" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)] text-primary hover:bg-[var(--gold)]/90 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="font-medium">Contáctanos</span>
            </a>
          </div>
        </div>
      </footer>
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
