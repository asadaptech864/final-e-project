export type PropertyHomes = {
  name: string
  slug: string
  location: string
  rate: string
  beds: number
  baths: number
  area: number
  images: PropertyImage[]
  roomType?: string
}

interface PropertyImage {
  src: string;
}
