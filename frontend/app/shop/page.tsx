import { SlidersHorizontal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"

const products = [
  {
    id: 1,
    name: "Pro Laptop X1",
    price: 1299.99,
    rating: 4.8,
    reviews: 342,
    image: "/modern-sleek-laptop-silver.jpg",
    category: "Laptops",
  },
  {
    id: 2,
    name: "Wireless Earbuds Pro",
    price: 199.99,
    rating: 4.6,
    reviews: 567,
    image: "/premium-wireless-earbuds-white.jpg",
    category: "Audio",
  },
  {
    id: 3,
    name: "Smart Watch Ultra",
    price: 399.99,
    rating: 4.7,
    reviews: 234,
    image: "/sleek-smartwatch-black.jpg",
    category: "Wearables",
  },
  {
    id: 4,
    name: "4K Action Camera",
    price: 349.99,
    rating: 4.9,
    reviews: 189,
    image: "/compact-action-camera-4k.jpg",
    category: "Cameras",
  },
  {
    id: 5,
    name: "Gaming Laptop Pro",
    price: 1899.99,
    rating: 4.9,
    reviews: 421,
    image: "/gaming-laptop-with-rgb.jpg",
    category: "Laptops",
  },
  {
    id: 6,
    name: "Noise Cancelling Headphones",
    price: 299.99,
    rating: 4.7,
    reviews: 892,
    image: "/premium-black-headphones.jpg",
    category: "Audio",
  },
  {
    id: 7,
    name: "Smartphone Pro Max",
    price: 999.99,
    rating: 4.8,
    reviews: 1234,
    image: "/flagship-smartphone-black.jpg",
    category: "Smartphones",
  },
  {
    id: 8,
    name: "Mechanical Gaming Keyboard",
    price: 149.99,
    rating: 4.6,
    reviews: 678,
    image: "/rgb-mechanical-keyboard.jpg",
    category: "Gaming",
  },
  {
    id: 9,
    name: '4K Smart TV 55"',
    price: 799.99,
    rating: 4.7,
    reviews: 345,
    image: "/modern-4k-smart-tv.jpg",
    category: "TVs",
  },
  {
    id: 10,
    name: "Wireless Gaming Mouse",
    price: 79.99,
    rating: 4.5,
    reviews: 456,
    image: "/ergonomic-gaming-mouse.jpg",
    category: "Gaming",
  },
  {
    id: 11,
    name: "Portable Bluetooth Speaker",
    price: 129.99,
    rating: 4.6,
    reviews: 523,
    image: "/portable-bluetooth-speaker.jpg",
    category: "Speakers",
  },
  {
    id: 12,
    name: "Fitness Tracker Band",
    price: 89.99,
    rating: 4.4,
    reviews: 789,
    image: "/fitness-tracker-smartband.jpg",
    category: "Wearables",
  },
]

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground">Shop All Products</h1>
          <p className="mt-2 text-muted-foreground">Showing 12 of 324 products</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64">
            <div className="sticky top-20 space-y-6 rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                <Button variant="ghost" size="sm" className="h-8 text-sm">
                  Clear all
                </Button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Category</h3>
                <div className="space-y-2">
                  {["Laptops", "Smartphones", "Audio", "Gaming", "Wearables", "Cameras", "TVs", "Speakers"].map(
                    (category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox id={category} />
                        <Label
                          htmlFor={category}
                          className="text-sm font-normal leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </Label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground">Price Range</h3>
                <div className="space-y-2">
                  {["Under $100", "$100 - $300", "$300 - $500", "$500 - $1000", "Over $1000"].map((range) => (
                    <div key={range} className="flex items-center space-x-2">
                      <Checkbox id={range} />
                      <Label
                        htmlFor={range}
                        className="text-sm font-normal leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {range}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground">Brand</h3>
                <div className="space-y-2">
                  {["Apple", "Samsung", "Sony", "LG", "Dell", "HP"].map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox id={brand} />
                      <Label
                        htmlFor={brand}
                        className="text-sm font-normal leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground">Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox id={`rating-${rating}`} />
                      <Label
                        htmlFor={`rating-${rating}`}
                        className="flex items-center gap-1 text-sm font-normal leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {rating}+ Stars
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Sort and View Options */}
            <div className="mb-6 flex items-center justify-between">
              <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Select defaultValue="featured">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-primary">{product.category}</p>
                    <h3 className="mt-1 text-pretty text-lg font-semibold text-foreground">{product.name}</h3>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium text-foreground">{product.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-2xl font-bold text-foreground">${product.price}</p>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
