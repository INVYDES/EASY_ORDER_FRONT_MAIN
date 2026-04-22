export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
}


export const products: Product[] = [
  {
    id: 1,
    name: 'Picadas',
    description: 'Las ricas picadas tradicionales',
    price: 75,
    category: 'comida'
    
  },
  {
    id: 2,
    name: 'Cecina',
    description: 'Cecina asada acompañada',
    price: 125,
    category: 'comida'

    
  },
  {
     id: 3,
    name: 'huevos',
    description: '2 huevos revueltos',
    price: 60,
    category: 'comida'
  },
    {
     id: 4,
    name: 'tacos de longanisa',
    description: 'tacos de longaniza acompañados de salsa y verdura',
    price: 60,
    category: 'comida'

  },
    {
     id: 5,
    name: 'esquites',
    description: '1 vaso de 8 oz de esquite con mayonesa o crema, queso,sal y limon',
    price: 60,
    category: 'comida'

  },
    {
     id: 6,
    name: 'coca cola',
    description: 'coca cola de 600 ml',
    price: 60,
    category: 'bebida'

  },
    {
     id: 7,
    name: 'peñafiel',
    description: 'peñafiel de 600 ml',
    price: 60,
    category: 'bebida'

  },
    {
     id: 8,
    name: 'del valle naranja',
    description: 'del valle naranja de 600 ml',
    price: 60,
    category: 'bebida'

  },
    {
     id: 9,
    name: 'agua de sabor',
    description: 'agua de sabor de 600 ml',
    price: 60,
    category: 'bebida'

  }
]

