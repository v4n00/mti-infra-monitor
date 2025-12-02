"use client"

import Image from "next/image"
import { Minus, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/navbar"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart()

  const subtotal = getTotalPrice()
  const shipping = items.length > 0 ? 15.0 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold text-foreground">Shopping Cart</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items - Left Side (2/3) */}
            <div className="space-y-4 lg:col-span-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
                  <p className="text-lg text-muted-foreground">Your cart is empty</p>
                  <Button className="mt-4" asChild>
                    <a href="/shop">Continue Shopping</a>
                  </Button>
                </div>
              ) : (
                <div className="max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/uploads/${item.image}`} alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8">
                            <X className="h-4 w-4 cursor-pointer" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-md border border-border">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-lg font-semibold text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Panel - Right Side (1/3) */}
            <div className="h-fit space-y-6 rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold text-foreground">Order Summary</h2>

              {/* Billing Address Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Billing Address</h3>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm">
                      Full Name
                    </Label>
                    <Input id="name" placeholder="John Doe" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input id="email" type="email" placeholder="john@example.com" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm">
                      Street Address
                    </Label>
                    <Input id="address" placeholder="123 Main St" className="mt-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-sm">
                        City
                      </Label>
                      <Input id="city" placeholder="New York" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="zip" className="text-sm">
                        ZIP Code
                      </Label>
                      <Input id="zip" placeholder="10001" className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-sm">
                      Country
                    </Label>
                    <Input id="country" placeholder="United States" className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full cursor-pointer" size="lg" disabled={items.length === 0}>
                Order Now
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Secure checkout · Ships within 2-3 business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
