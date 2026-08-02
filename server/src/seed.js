import { query, migrate } from './db.js';
import { randomBytes } from 'node:crypto';

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;
const imgThumb = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=70`;

function photos(...ids) {
  return ids.flatMap((id) => [img(id), imgThumb(id)]);
}

const cars = [
  {
    make: 'Toyota', model: 'Corolla GLi', year: 2019, price: 14500, mileage: 42000,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'FWD',
    color: 'Pearl White', condition: 'Used', location: 'Clifton, Karachi',
    vin: 'NHTC33BE2K5012784', images: photos('photo-1555215695-3004980ad54e', 'photo-1542362567-b07e54358753'),
    features: ['Power Windows', 'Power Steering', 'ABS', 'Backup Camera', 'Bluetooth', 'Air Conditioning', 'Keyless Entry'],
    description: 'One-owner 2019 Toyota Corolla GLi in excellent condition. Regular oil changes at Toyota Karachi. Extremely fuel-efficient and reliable.',
    seller: { name: 'Port Grand Motors', email: 'sales@portgrandmotors.pk', phone: '+92 21 3566 1234' }
  },
  {
    make: 'Honda', model: 'Civic VTi Oriel', year: 2020, price: 18900, mileage: 35000,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Crystal Black', condition: 'Used', location: 'DHA Phase 5, Karachi',
    vin: 'SHHFK2360LU504189', images: photos('photo-1542362567-b07e54358753', 'photo-1555215695-3004980ad54e'),
    features: ['Sunroof', 'Leather Seats', 'Navigation', 'Backup Camera', 'Honda Sensing', 'Bluetooth', 'Cruise Control'],
    description: 'Top-of-the-line Civic VTi Oriel with sunroof and leather. Well-maintained, single owner, all Honda dealership service records.',
    seller: { name: 'Clifton Auto Gallery', email: 'info@cliftonautogallery.pk', phone: '+92 21 3587 4567' }
  },
  {
    make: 'Suzuki', model: 'Cultus VXL', year: 2021, price: 8200, mileage: 28000,
    bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'FWD',
    color: 'Cerulean Blue', condition: 'Used', location: 'Gulshan-e-Iqbal, Karachi',
    vin: 'JS2JBABC2V6103491', images: photos('photo-1533473359331-0135ef1b58bf', 'photo-1493238792000-8113da705763'),
    features: ['Power Windows', 'Air Conditioning', 'Bluetooth', 'USB Charging', 'ABS', 'Airbag'],
    description: 'VXL trim Cultus with the new K-series engine. Outstanding fuel economy in Karachi traffic. All documents clear.',
    seller: { name: 'Sindh Auto Sales', email: 'sindhautosales@gmail.com', phone: '+92 21 3481 7890' }
  },
  {
    make: 'Suzuki', model: 'Mehran VX', year: 2017, price: 4800, mileage: 65000,
    bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'RWD',
    color: 'Super White', condition: 'Used', location: 'Nazimabad, Karachi',
    vin: 'JS2MB11A3H4102835', images: photos('photo-1494976388531-d1058494cdd8', 'photo-1493238792000-8113da705763'),
    features: ['Air Conditioning', 'Power Steering', 'USB Port'],
    description: 'Pakistan most iconic car. Simple, reliable, and incredibly cheap to maintain. Mechanically sound.',
    seller: { name: 'B Saddar Motors', email: 'bsaddar.motors@gmail.com', phone: '+92 21 3456 1122' }
  },
  {
    make: 'Kia', model: 'Sportage AWD', year: 2022, price: 24500, mileage: 18000,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Snow White Pearl', condition: 'Used', location: 'Bahria Town, Karachi',
    vin: 'U5YPB81ABBNL508234', images: photos('photo-1511919884226-fd3cad34687c', 'photo-1542282088-fe8426682b8f'),
    features: ['Panoramic Sunroof', 'Leather Seats', 'Ventilated Seats', 'Touchscreen', 'Wireless Charging', 'Lane Keep Assist'],
    description: 'Kia Sportage AWD with panoramic roof. Bought from Kia Lucky Motors, under complete warranty.',
    seller: { name: 'Bahria Auto Hub', email: 'bahriaautohub@gmail.com', phone: '+92 21 3725 3344' }
  },
  {
    make: 'Toyota', model: 'Fortuner Sigma 4', year: 2021, price: 38500, mileage: 22000,
    bodyType: 'SUV', fuelType: 'Diesel', transmission: 'Automatic', drivetrain: '4WD',
    color: 'Phantom Brown', condition: 'Used', location: 'Defence Phase 8, Karachi',
    vin: 'JTEBUBFJ50K304567', images: photos('photo-1519245659620-e859806a8d3b', 'photo-1568605114967-8130f3a36994'),
    features: ['4x4', 'Diesel Turbo', 'Crawl Control', 'Leather Seats', 'Sunroof', 'Power Tailgate'],
    description: 'Toyota Fortuner Sigma 4 in diesel. Low mileage, complete Toyota Indus service history.',
    seller: { name: 'Defence Premium Cars', email: 'defencepremium@gmail.com', phone: '+92 21 3584 5566' }
  },
  {
    make: 'Hyundai', model: 'Tucson AWD', year: 2022, price: 27500, mileage: 15000,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Amazon Gray', condition: 'Used', location: 'Gulshan-e-Hadeed, Karachi',
    vin: 'TMAJ38F3XKJ503921', images: photos('photo-1549399542-7e3f8b79c341', 'photo-1511919884226-fd3cad34687c'),
    features: ['Panoramic Roof', 'Heated Seats', 'Blind Spot Monitor', 'Smart Cruise Control', 'Apple CarPlay', 'Power Tailgate'],
    description: 'Hyundai Tucson loaded with every option. Still under Hyundai Nishat warranty.',
    seller: { name: 'Hyundai Hub Karachi', email: 'hyundaikhi@gmail.com', phone: '+92 21 3636 7788' }
  },
  {
    make: 'Suzuki', model: 'Swift GLX', year: 2022, price: 9500, mileage: 12000,
    bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Criminal Red', condition: 'Used', location: 'PECHS, Karachi',
    vin: 'JS2JBABC4V6108745', images: photos('photo-1544636331-e26879cd4d9b', 'photo-1533473359331-0135ef1b58bf'),
    features: ['Automatic Transmission', 'Touchscreen', 'Bluetooth', 'Cruise Control', 'Push Start', 'Keyless Entry'],
    description: 'New-gen Suzuki Swift GLX automatic. Sporty looks, peppy engine, excellent fuel economy.',
    seller: { name: 'PECHS Auto Mart', email: 'pechsautomart@gmail.com', phone: '+92 21 3453 9900' }
  },
  {
    make: 'Honda', model: 'City 1.5L CVT', year: 2020, price: 13200, mileage: 38000,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Taffeta White', condition: 'Used', location: 'North Nazimabad, Karachi',
    vin: 'SANK33A32L7503489', images: photos('photo-1541899481282-d53bffe3c35d', 'photo-1493238792000-8113da705763'),
    features: ['CVT Automatic', 'Touchscreen', 'Bluetooth', 'Rear Camera', 'Air Conditioning', 'Dual Airbags'],
    description: 'Honda City 1.5L CVT. Extremely popular in Karachi for its smooth CVT in stop-and-go traffic.',
    seller: { name: 'Nazimabad Motors', email: 'nazimabadmotors@gmail.com', phone: '+92 21 3663 2211' }
  },
  {
    make: 'Toyota', model: 'Hilux Revo G', year: 2021, price: 29800, mileage: 30000,
    bodyType: 'Truck', fuelType: 'Diesel', transmission: 'Automatic', drivetrain: '4WD',
    color: 'Attitude Black', condition: 'Used', location: 'Surjani Town, Karachi',
    vin: 'MR0KB3CD60K009876', images: photos('photo-1568605114967-8130f3a36994', 'photo-1502161254066-6c74afbf07aa'),
    features: ['4x4 Diesel', 'Automatic', 'Touchscreen', 'Bluetooth', 'Rear Differential Lock', 'Hill Start Assist'],
    description: 'Toyota Hilux Revo G. Diesel automatic, perfect for both city driving and trips to Northern areas.',
    seller: { name: 'KhiTrucks Sales', email: 'khitrucks@gmail.com', phone: '+92 21 3690 4455' }
  },
  {
    make: 'Daihatsu', model: 'Cuore EX', year: 2018, price: 5200, mileage: 52000,
    bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'FWD',
    color: 'Silky Silver', condition: 'Used', location: 'Orangi Town, Karachi',
    vin: 'B3A1000036482', images: photos('photo-1493238792000-8113da705763', 'photo-1494976388531-d1058494cdd8'),
    features: ['Air Conditioning', 'Power Steering', 'USB Port', 'CD Player'],
    description: 'Budget-friendly Daihatsu Cuore. Perfect city runabout for Karachi. Incredibly cheap to run.',
    seller: { name: 'B Saddar Motors', email: 'bsaddar.motors@gmail.com', phone: '+92 21 3456 1122' }
  },
  {
    make: 'MG', model: 'HS 1.5T', year: 2022, price: 21500, mileage: 10000,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Glacier White', condition: 'Used', location: 'DHA Phase 6, Karachi',
    vin: 'LSJA24U96N0056789', images: photos('photo-1549399542-7e3f8b79c341', 'photo-1542282088-fe8426682b8f'),
    features: ['Panoramic Sunroof', 'Leather Seats', 'Touchscreen', '360 Camera', 'ADAS', 'Wireless Charging', 'Bose Audio'],
    description: 'MG HS with premium features at competitive price. Fully loaded 1.5T with panoramic roof and ADAS.',
    seller: { name: 'MG Showroom Karachi', email: 'mgkarachi@gmail.com', phone: '+92 21 3529 8877' }
  },
  {
    make: 'Suzuki', model: 'Bolan VX', year: 2020, price: 5800, mileage: 45000,
    bodyType: 'Van', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'RWD',
    color: 'Super White', condition: 'Used', location: 'SITE Area, Karachi',
    vin: 'JS3TB23SXL4105678', images: photos('photo-1502161254066-6c74afbf07aa', 'photo-1568605114967-8130f3a36994'),
    features: ['Rear AC Vents', 'Seatbelts', 'Sliding Doors'],
    description: 'Suzuki Bolan. Used but mechanically sound, perfect for goods delivery or family use.',
    seller: { name: 'SITE Auto Market', email: 'siteautomarket@gmail.com', phone: '+92 21 3257 3344' }
  },
  {
    make: 'Toyota', model: 'RAV4 Hybrid', year: 2022, price: 32500, mileage: 18400,
    bodyType: 'SUV', fuelType: 'Hybrid', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Blizzard Pearl', condition: 'Used', location: 'Austin, TX',
    vin: 'JTMR4REV7ND0A1201', images: photos('photo-1511919884226-fd3cad34687c', 'photo-1542282088-fe8426682b8f'),
    features: ['Adaptive Cruise Control', 'Blind Spot Monitoring', 'Backup Camera', 'Apple CarPlay', 'Heated Seats', 'Lane Keep Assist', 'Power Liftgate'],
    description: 'One-owner 2022 RAV4 Hybrid XLE Premium. Excellent fuel economy at 41 MPG combined.',
    seller: { name: 'Lone Star Motors', email: 'sales@lonestarmotors.com', phone: '(512) 555-0142' }
  },
  {
    make: 'Honda', model: 'Civic EX', year: 2021, price: 23500, mileage: 22000,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Platinum White Pearl', condition: 'Used', location: 'Dallas, TX',
    vin: '19XFC2F57ME500881', images: photos('photo-1541899481282-d53bffe3c35d', 'photo-1493238792000-8113da705763'),
    features: ['Honda Sensing', 'Backup Camera', 'Apple CarPlay', 'Android Auto', 'Lane Keep Assist'],
    description: 'Sensible and efficient Civic EX. One owner, dealer-serviced every 5,000 miles, clean Carfax.',
    seller: { name: 'Metro Honda', email: 'inventory@metrohonda.com', phone: '(214) 555-0176' }
  },
  {
    make: 'Ford', model: 'F-150 Lariat', year: 2020, price: 38900, mileage: 41000,
    bodyType: 'Truck', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: '4WD',
    color: 'Oxford White', condition: 'Used', location: 'Houston, TX',
    vin: '1FTFW1E54LFA10402', images: photos('photo-1568605114967-8130f3a36994', 'photo-1502161254066-6c74afbf07aa'),
    features: ['4x4', 'Tow Package', 'Leather Seats', 'Heated & Ventilated Seats', 'Backup Camera', 'Trailer Brake Controller'],
    description: 'Lariat trim with the 2.7L EcoBoost. 4WD, tow package rated at 12,000 lbs.',
    seller: { name: 'Bayou Ford', email: 'trucks@bayouford.com', phone: '(713) 555-0198' }
  },
  {
    make: 'Tesla', model: 'Model 3 Long Range', year: 2023, price: 41900, mileage: 12500,
    bodyType: 'Sedan', fuelType: 'Electric', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Pearl White', condition: 'Used', location: 'Austin, TX',
    vin: '5YJ3E1EB5PF213457', images: photos('photo-1560958089-b8a1929cea89', 'photo-1617788138017-80ad40651399'),
    features: ['Autopilot', 'Full Glass Roof', '15in Touchscreen', 'Heated Seats', 'Over-the-Air Updates', '330 mi Range'],
    description: 'Low-mileage Model 3 Long Range with 330 miles of range. Factory warranty until 2027.',
    seller: { name: 'Hill Country EVs', email: 'hello@hillcountryevs.com', phone: '(512) 555-0167' }
  },
  {
    make: 'BMW', model: '330i', year: 2019, price: 28900, mileage: 33800,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Mineral Grey', condition: 'Used', location: 'San Antonio, TX',
    vin: 'WBA5R1C53KAE00418', images: photos('photo-1555215695-3004980ad54e', 'photo-1542362567-b07e54358753'),
    features: ['M Sport Package', 'Leather', 'Heated Seats', 'Navigation', 'Apple CarPlay', 'Harman Kardon Sound'],
    description: 'CPO-eligible 330i with M Sport package. Spotless service history.',
    seller: { name: 'Alamo BMW', email: 'preowned@alamobmw.com', phone: '(210) 555-0131' }
  },
  {
    make: 'Chevrolet', model: 'Camaro SS', year: 2022, price: 42900, mileage: 14500,
    bodyType: 'Coupe', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Rapid Blue', condition: 'Used', location: 'Austin, TX',
    vin: '1G1FH1R71N0104768', images: photos('photo-1552519507-da3b142c6e3d', 'photo-1544636331-e26879cd4d9b'),
    features: ['6.2L V8 (455 HP)', 'Magnetic Ride Control', 'Launch Control', 'Bose Audio', 'Alcantara Seats'],
    description: 'A 455-horsepower V8 with the 10-speed auto. Only 14,500 miles, adult-owned.',
    seller: { name: 'Velocity Auto Group', email: 'gt@velocityautogroup.com', phone: '(512) 555-0129' }
  },
  {
    make: 'Porsche', model: '911 Carrera', year: 2018, price: 79900, mileage: 35200,
    bodyType: 'Coupe', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Guards Red', condition: 'Used', location: 'Austin, TX',
    vin: 'WP0AB2A92JS115034', images: photos('photo-1503376780353-7e6692767b70', 'photo-1544636331-e26879cd4d9b', 'photo-1502877338535-766e1452684a'),
    features: ['PDK Transmission', 'Sport Chrono Package', 'Bose Surround Sound', 'Sport Exhaust', 'PASM Suspension'],
    description: 'The 991.2 911 Carrera with PDK and Sport Chrono. Fresh 35k service completed.',
    seller: { name: 'Velocity Auto Group', email: 'gt@velocityautogroup.com', phone: '(512) 555-0129' }
  }
];

export async function seed(force = false) {
  await migrate();
  const { rows } = await query('SELECT COUNT(*)::int AS c FROM listings');
  if (rows[0].c > 0 && !force) {
    console.log(`DB already has ${rows[0].c} listings — skipping seed.`);
    return;
  }
  if (rows[0].c > 0) await query('DELETE FROM leads; DELETE FROM listings; ALTER SEQUENCE listings_id_seq RESTART WITH 1; ALTER SEQUENCE leads_id_seq RESTART WITH 1;');

  for (const c of cars) {
    const token = randomBytes(16).toString('hex');
    await query(`
      INSERT INTO listings (title, description, make, model, year, price, mileage, body_type, fuel_type,
        transmission, drivetrain, color, condition, location, vin, features, images,
        seller_name, seller_email, seller_phone, edit_token)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
    `, [
      `${c.year} ${c.make} ${c.model}`, c.description, c.make, c.model, c.year, c.price, c.mileage,
      c.bodyType, c.fuelType, c.transmission, c.drivetrain, c.color, c.condition, c.location, c.vin,
      JSON.stringify(c.features), JSON.stringify(c.images),
      c.seller.name, c.seller.email, c.seller.phone, token
    ]);
  }
  console.log(`Seeded ${cars.length} listings.`);
}
