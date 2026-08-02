export interface Listing {
  id: number;
  title: string;
  description: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  color: string;
  condition: string;
  location: string;
  vin: string;
  features: string[];
  images: string[];
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  createdAt: number;
  editToken: string | null;
  views: number;
  favorites: number;
}

export interface ListingListResponse {
  items: Listing[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface MakeOption {
  make: string;
  models: string[];
  count: number;
}

export interface Meta {
  makes: MakeOption[];
  bodyTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
  drivetrains: string[];
  conditions: string[];
}

export interface Filters {
  q?: string;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  drivetrain?: string[];
  condition?: string[];
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface ListingPayload {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  color: string;
  condition: string;
  location: string;
  vin: string;
  description: string;
  features: string[];
  images: string[];
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
}

export interface Inquiry {
  id: number;
  listingId: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: number;
}

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest listings' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Year: Newest first' },
  { value: 'year_asc', label: 'Year: Oldest first' },
  { value: 'mileage_asc', label: 'Mileage: Low to High' }
];

export const FUEL_TYPES = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid'];
export const BODY_TYPES = ['Sedan', 'SUV', 'Coupe', 'Truck', 'Convertible', 'Hatchback', 'Wagon', 'Van', 'Minivan'];
export const TRANSMISSIONS = ['Automatic', 'Manual'];
export const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];
export const CONDITIONS = ['New', 'Used', 'Certified Pre-Owned'];
