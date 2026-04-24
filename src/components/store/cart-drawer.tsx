'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, Trash2, Plus, Minus, X, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart'

interface CartDrawerProps {
  onCheckout: () => void
}

function CartBadge({ count }: { count: number }) {
  const [pop, setPop] = useState(false)
  const [prev, setPrev] = useState(count)

  useEffect(() => {
    if (count > prev) {
      setPop(true)
      const t = setTimeout(() => setPop(false), 350)
      return () => clearTimeout(t)
    }
    setPrev(count)
  }, [count, prev])

  if (count === 0) return null

  return (
    <span
      className={`absolute -top-1 -right-1 bg-[var(--gold)] text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-transform ${pop ? 'scale-150' : 'scale-100'}`}
      style={{ transitionDuration: '200ms' }}
    >
      {count}
    </span>
  )
}

function CartTriggerButton({
  onClick,
  count,
}: {
  onClick: () => void
  count: number
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="relative rounded-full border-border/50 hover:border-[var(--gold)] hover:text-[var(--gold)]"
      onClick={onClick}
      aria-label={`Carrito, ${count} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      <CartBadge count={count} />
    </Button>
  )
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const { items, removeItem, updateQuantity, getTotal, clearCart, getTotalItems } = useCartStore()

  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0)
    return () => clearTimeout(t)
  }, [])

  const count = hydrated ? getTotalItems() : 0

  const handleCheckout = () => {
    onCheckout()
    setOpen(false)
  }

  return (
    <>
      {/* Header trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <CartTriggerButton onClick={() => setOpen(true)} count={count} />
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl">Tu Carrito</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="h-10 w-10 opacity-50" />
              </div>
              <p className="text-lg font-medium">Tu carrito está vacío</p>
              <p className="text-sm mt-1">Añade carteras para continuar</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6 my-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-[var(--gold)] font-medium">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-border/50"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(0, item.quantity - 1))
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-border/50"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="space-y-4 pt-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-2xl font-bold">${getTotal().toFixed(2)}</span>
                </div>

                <SheetFooter className="flex-col gap-3 sm:flex-col">
                  <Button
                    className="w-full h-12 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-full text-base"
                    onClick={handleCheckout}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Enviar Pedido por WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-border/50"
                    onClick={clearCart}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Vaciar Carrito
                  </Button>
                </SheetFooter>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* FAB — visible solo en móvil cuando hay items */}
      {hydrated && count > 0 && (
        <button
          onClick={() => setOpen(true)}
          aria-label={`Abrir carrito, ${count} items`}
          className="fixed bottom-6 right-6 z-40 md:hidden flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-[var(--gold)] text-primary shadow-lg shadow-[var(--gold)]/30 hover:bg-[var(--gold)]/90 active:scale-95 transition-all duration-200 animate-fade-in-up"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold text-sm">{count} {count === 1 ? 'item' : 'items'}</span>
          <span className="font-bold text-sm">· ${getTotal().toFixed(2)}</span>
        </button>
      )}
    </>
  )
}
