import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Laptop, Smartphone, Headphones, Gamepad2, Watch, Camera, Tv, Speaker } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  const categories = [
    { name: "Laptops", icon: Laptop, description: "Powerful computing for work & play" },
    { name: "Smartphones", icon: Smartphone, description: "Latest mobile technology" },
    { name: "Audio", icon: Headphones, description: "Premium sound experiences" },
    { name: "Gaming", icon: Gamepad2, description: "Next-gen gaming gear" },
    { name: "Wearables", icon: Watch, description: "Smart watches & fitness trackers" },
    { name: "Cameras", icon: Camera, description: "Capture every moment" },
    { name: "TVs", icon: Tv, description: "Immersive entertainment" },
    { name: "Speakers", icon: Speaker, description: "High-fidelity audio" },
  ]

  const featuredProducts = [
    {
      id: 1,
      name: 'Pro Laptop 15"',
      price: 1299,
      image: "/modern-sleek-laptop-silver.jpg",
      category: "Laptops",
    },
    {
      id: 2,
      name: "Wireless Earbuds",
      price: 199,
      image: "/premium-wireless-earbuds-white.jpg",
      category: "Audio",
    },
    {
      id: 3,
      name: "Smart Watch Pro",
      price: 399,
      image: "/sleek-smartwatch-black.jpg",
      category: "Wearables",
    },
    {
      id: 4,
      name: "4K Action Camera",
      price: 349,
      image: "/compact-action-camera-4k.jpg",
      category: "Cameras",
    },
  ]

  const collections = [
    {
      name: "Living Room",
      description: "Curated comfort for modern living",
      image: "/modern-living-room.png",
    },
    {
      name: "Bedroom",
      description: "Create your perfect sanctuary",
      image: "/minimalist-bedroom-design.jpg",
    },
    {
      name: "Office",
      description: "Productivity meets style",
      image: "/modern-home-office.png",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Power Your Digital Life
              </h1>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
                Discover cutting-edge electronics and tech essentials that keep you connected, productive, and
                entertained.
              </p>
              <div className="mt-10 flex flex-wrap">
                <Button size="lg" className="text-base" asChild>
                  <Link href="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-auto">
              <Image
                src="/modern-electronics-tech-devices-showcase.jpg"
                alt="Featured electronics"
                width={700}
                height={700}
                className="rounded-lg object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Now placed prominently */}
      <section className="bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">Find the perfect tech for every need</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card
                  key={index}
                  className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-105"
                >
                  <div className="flex flex-col items-center p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{category.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">Stay Updated</h2>
          <p className="mt-4 text-pretty text-lg text-primary-foreground/90">
            Get exclusive access to new releases, special offers, and tech news.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 rounded-md border-0 px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 sm:w-80"
            />
            <Button size="lg" variant="secondary" className="h-12 text-base">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Shop</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    All Products
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Sale
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Support</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2025 Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
