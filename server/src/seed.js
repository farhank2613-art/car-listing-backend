import { db, prepare, migrate } from './db.js';
import { randomBytes } from 'node:crypto';

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;
const imgThumb = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=70`;

function photos(...ids) {
  return ids.flatMap((id) => [img(id), imgThumb(id)]);
}

const base = {
  'photo-1503376780353-7e6692767b70': 'sporty coupe',
  'photo-1552519507-da3b142c6e3d': 'american muscle',
  'photo-1494976388531-d1058494cdd8': 'classic muscle',
  'photo-1555215695-3004980ad54e': 'luxury sedan',
  'photo-1502877338535-766e1452684a': 'sports car',
  'photo-1568605114967-8130f3a36994': 'pickup truck',
  'photo-1549317661-bd32c8ce0db2': 'luxury coupe',
  'photo-1553440569-bcc63803a83d': 'sporty sedan',
  'photo-1583121274602-3e2820c69888': 'exotic supercar',
  'photo-1511919884226-fd3cad34687c': 'modern suv',
  'photo-1542362567-b07e54358753': 'executive sedan',
  'photo-1533473359331-0135ef1b58bf': 'hot hatch',
  'photo-1544636331-e26879cd4d9b': 'red sports',
  'photo-1493238792000-8113da705763': 'city car',
  'photo-1519641471654-76ce0107ad1b': 'convertible',
  'photo-1592194996308-7b43878e84a6': 'italian supercar',
  'photo-1542282088-fe8426682b8f': 'yellow sports',
  'photo-1519245659620-e859806a8d3b': 'suv offroad',
  'photo-1502161254066-6c74afbf07aa': 'vintage car',
  'photo-1541899481282-d53bffe3c35d': 'classic sedan'
};

const cars = [
  {
    make: 'Toyota', model: 'RAV4 Hybrid', year: 2022, price: 32500, mileage: 18400,
    bodyType: 'SUV', fuelType: 'Hybrid', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Blizzard Pearl', condition: 'Used', location: 'Austin, TX',
    vin: 'JTMR4REV7ND0A1201', images: photos('photo-1511919884226-fd3cad34687c', 'photo-1542282088-fe8426682b8f'),
    features: ['Adaptive Cruise Control', 'Blind Spot Monitoring', 'Backup Camera', 'Apple CarPlay', 'Heated Seats', 'Lane Keep Assist', 'Power Liftgate', 'All-Wheel Drive'],
    description: 'One-owner 2022 RAV4 Hybrid with the XLE Premium trim. Excellent fuel economy at 41 MPG combined. Clean history, no accidents, and regularly serviced at Toyota. Power liftgate and heated front seats make it an ideal family hauler.',
    seller: { name: 'Lone Star Motors', email: 'sales@lonestarmotors.com', phone: '(512) 555-0142' }
  },
  {
    make: 'Honda', model: 'Civic EX', year: 2021, price: 23500, mileage: 22000,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Platinum White Pearl', condition: 'Used', location: 'Dallas, TX',
    vin: '19XFC2F57ME500881', images: photos('photo-1541899481282-d53bffe3c35d', 'photo-1493238792000-8113da705763'),
    features: ['Honda Sensing', 'Backup Camera', 'Apple CarPlay', 'Android Auto', 'Lane Keep Assist', 'Adaptive Cruise Control', 'Leather Steering Wheel'],
    description: 'Sensible and efficient Civic EX. One owner, dealer-serviced every 5,000 miles, clean Carfax. Averaging 38 MPG. The Honda Sensing suite keeps every drive safe and easy.',
    seller: { name: 'Metro Honda', email: 'inventory@metrohonda.com', phone: '(214) 555-0176' }
  },
  {
    make: 'Ford', model: 'F-150 Lariat', year: 2020, price: 38900, mileage: 41000,
    bodyType: 'Truck', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: '4WD',
    color: 'Oxford White', condition: 'Used', location: 'Houston, TX',
    vin: '1FTFW1E54LFA10402', images: photos('photo-1568605114967-8130f3a36994', 'photo-1502161254066-6c74afbf07aa'),
    features: ['4x4', 'Tow Package', 'Leather Seats', 'Heated & Ventilated Seats', 'Backup Camera', 'Blind Spot Monitoring', 'Power Tailgate', 'Trailer Brake Controller'],
    description: 'Lariat trim with the 2.7L EcoBoost. 4WD, tow package rated at 12,000 lbs, leather interior. Recently replaced tires and brakes. A proven workhorse for any job site or weekend trip.',
    seller: { name: 'Bayou Ford', email: 'trucks@bayouford.com', phone: '(713) 555-0198' }
  },
  {
    make: 'Tesla', model: 'Model 3 Long Range', year: 2023, price: 41900, mileage: 12500,
    bodyType: 'Sedan', fuelType: 'Electric', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Pearl White', condition: 'Used', location: 'Austin, TX',
    vin: '5YJ3E1EB5PF213457', images: photos('photo-1560958089-b8a1929cea89', 'photo-1617788138017-80ad40651399'),
    features: ['Autopilot', 'Full Glass Roof', '15" Touchscreen', 'Heated Seats', 'Over-the-Air Updates', '330 mi Range', 'Supercharging'],
    description: 'Low-mileage Model 3 Long Range with 330 miles of range. Factory warranty until 2027. Includes Enhanced Autopilot and a fresh detail. The smartest daily driver money can buy.',
    seller: { name: 'Hill Country EVs', email: 'hello@hillcountryevs.com', phone: '(512) 555-0167' }
  },
  {
    make: 'BMW', model: '330i', year: 2019, price: 28900, mileage: 33800,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Mineral Grey', condition: 'Used', location: 'San Antonio, TX',
    vin: 'WBA5R1C53KAE00418', images: photos('photo-1555215695-3004980ad54e', 'photo-1542362567-b07e54358753'),
    features: ['M Sport Package', 'Leather', 'Heated Seats', 'Navigation', 'Apple CarPlay', 'Parking Sensors', 'Harman Kardon Sound'],
    description: 'CPO-eligible 330i with the M Sport package. Spotless service history at BMW San Antonio. Tight, balanced handling and all the tech you need, in a package that still turns heads.',
    seller: { name: 'Alamo BMW', email: 'preowned@alamobmw.com', phone: '(210) 555-0131' }
  },
  {
    make: 'Chevrolet', model: 'Camaro SS', year: 2022, price: 42900, mileage: 14500,
    bodyType: 'Coupe', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Rapid Blue', condition: 'Used', location: 'Austin, TX',
    vin: '1G1FH1R71N0104768', images: photos('photo-1552519507-da3b142c6e3d', 'photo-1544636331-e26879cd4d9b'),
    features: ['6.2L V8 (455 HP)', 'Magnetic Ride Control', 'Launch Control', 'Bose Audio', 'Alcantara Seats', 'Performance Brakes'],
    description: 'A 455-horsepower V8 with the 10-speed auto and Magnetic Ride. Only 14,500 miles, adult-owned, never raced. Sounds like thunder, drives like a scalpel. Perfect weekend toy or daily grin machine.',
    seller: { name: 'Velocity Auto Group', email: 'gt@velocityautogroup.com', phone: '(512) 555-0129' }
  },
  {
    make: 'Jeep', model: 'Wrangler Unlimited', year: 2021, price: 36500, mileage: 27800,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: '4WD',
    color: 'Firecracker Red', condition: 'Used', location: 'Dallas, TX',
    vin: '1C4HJXFG7MW535210', images: photos('photo-1519245659620-e859806a8d3b', 'photo-1542282088-fe8426682b8f'),
    features: ['Removable Hard Top', '4x4', 'Off-Road Tires', 'LED Lighting', 'Blind Spot Monitoring', 'Tow Hooks', 'Cold Weather Group'],
    description: 'Unlimited Sport with the manual transmission and removable hard top. 4x4 with off-road tires, ready for Moab or the mall. Clean Texas title, no frame damage.',
    seller: { name: 'North Texas Jeep', email: 'jeeps@northtexasjeep.com', phone: '(972) 555-0184' }
  },
  {
    make: 'Audi', model: 'Q5 Premium', year: 2020, price: 31500, mileage: 29600,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Navarra Blue', condition: 'Used', location: 'Houston, TX',
    vin: 'WA1BNAFY4L2041071', images: photos('photo-1553440569-bcc63803a83d', 'photo-1549399542-7e3f8b79c341'),
    features: ['Quattro AWD', 'Virtual Cockpit', 'Panoramic Sunroof', 'Heated Seats', 'Adaptive Cruise Control', '360 Camera'],
    description: 'Audi Q5 with Quattro AWD and the Premium Plus package. Virtual cockpit, panoramic roof, and a plush, quiet ride. Full service history at Audi Houston.',
    seller: { name: 'Gulf Coast Audi', email: 'preowned@gulfcoastaudi.com', phone: '(281) 555-0115' }
  },
  {
    make: 'Hyundai', model: 'Ioniq 5 SEL', year: 2023, price: 39800, mileage: 9100,
    bodyType: 'SUV', fuelType: 'Electric', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Atlas White', condition: 'Used', location: 'Austin, TX',
    vin: 'KM8KRDAF4PU145779', images: photos('photo-1617788138017-80ad40651399', 'photo-1592194996308-7b43878e84a6'),
    features: ['303 mi Range', '800V Fast Charging', 'Heated & Ventilated Seats', 'Head-Up Display', 'Bose Audio', 'V2L Power Outlet'],
    description: 'Nearly-new Ioniq 5 SEL with just over 9,000 miles. 303-mile range and 800V fast charging make road trips painless. Remaining factory warranty, spotless inside and out.',
    seller: { name: 'Hill Country EVs', email: 'hello@hillcountryevs.com', phone: '(512) 555-0167' }
  },
  {
    make: 'Mercedes-Benz', model: 'C300', year: 2021, price: 33500, mileage: 25000,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Polar White', condition: 'Used', location: 'Dallas, TX',
    vin: 'W1KWF8HB4MR344582', images: photos('photo-1542362567-b07e54358753', 'photo-1555215695-3004980ad54e'),
    features: ['MBUX Infotainment', 'Leather', 'Heated Seats', 'Ambient Lighting', 'Parking Assist', 'Apple CarPlay', 'Adaptive Suspension'],
    description: 'Executive compact luxury done right. The C300 pairs a smooth turbo four with a beautifully trimmed cabin. Two keys, full records, balance of factory warranty.',
    seller: { name: 'Dallas Prestige Auto', email: 'sales@dallasprestige.com', phone: '(214) 555-0171' }
  },
  {
    make: 'Porsche', model: '911 Carrera', year: 2018, price: 79900, mileage: 35200,
    bodyType: 'Coupe', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'RWD',
    color: 'Guards Red', condition: 'Used', location: 'Austin, TX',
    vin: 'WP0AB2A92JS115034', images: photos('photo-1503376780353-7e6692767b70', 'photo-1544636331-e26879cd4d9b', 'photo-1502877338535-766e1452684a'),
    features: ['PDK Transmission', 'Sport Chrono Package', 'Bose Surround Sound', 'Sport Exhaust', 'Adaptive Seats', 'PASM Suspension'],
    description: 'The 991.2 911 Carrera with PDK and Sport Chrono. Guards Red over black leather. Fresh 35k service completed, new tires. The benchmark sports car, now at a sensible entry point.',
    seller: { name: 'Velocity Auto Group', email: 'gt@velocityautogroup.com', phone: '(512) 555-0129' }
  },
  {
    make: 'Nissan', model: 'Rogue SV', year: 2022, price: 27800, mileage: 16300,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Gun Metallic', condition: 'Used', location: 'San Antonio, TX',
    vin: '5N1BT3BBXNC756024', images: photos('photo-1519641471654-76ce0107ad1b', 'photo-1533473359331-0135ef1b58bf'),
    features: ['AWD', 'ProPILOT Assist', '360 Camera', 'Heated Seats', 'Apple CarPlay', 'Panoramic Roof', 'Power Liftgate'],
    description: 'Loaded SV with ProPILOT Assist and a 360-degree camera. AWD and generous cargo space. Clean history, dealer-maintained. Excellent value in the compact crossover segment.',
    seller: { name: 'Alamo Nissan', email: 'used@alamonissan.com', phone: '(210) 555-0123' }
  },
  {
    make: 'Toyota', model: 'Tacoma TRD Off-Road', year: 2020, price: 33900, mileage: 39500,
    bodyType: 'Truck', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: '4WD',
    color: 'Cement Gray', condition: 'Used', location: 'Austin, TX',
    vin: '3TMCZ5AN7LM206318', images: photos('photo-1568605114967-8130f3a36994', 'photo-1502161254066-6c74afbf07aa'),
    features: ['4x4', 'TRD Off-Road Package', 'Crawl Control', 'Locking Rear Diff', 'Tow Package', 'Bed Liner', 'Skid Plates'],
    description: 'TRD Off-Road Tacoma in the coveted Cement Gray. Crawl Control, locking rear diff, and a clean undercarriage. Retains value like nothing else on the road.',
    seller: { name: 'Lone Star Motors', email: 'sales@lonestarmotors.com', phone: '(512) 555-0142' }
  },
  {
    make: 'Mazda', model: 'MX-5 Miata', year: 2021, price: 25900, mileage: 19000,
    bodyType: 'Convertible', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'RWD',
    color: 'Soul Red Crystal', condition: 'Used', location: 'Dallas, TX',
    vin: 'JM1NDAM75M0502789', images: photos('photo-1519641471654-76ce0107ad1b', 'photo-1544636331-e26879cd4d9b'),
    features: ['6-Speed Manual', 'Soft Top', 'Bose Audio', 'Heated Seats', 'Apple CarPlay', 'LSD'],
    description: 'Pure driving joy in Soul Red Crystal. The Miata is endlessly reliable and this one is a weekend toy with garage-kept paint. Limited-slip diff and the 6-speed manual.',
    seller: { name: 'North Texas Auto', email: 'sales@northtexasauto.com', phone: '(972) 555-0193' }
  },
  {
    make: 'Subaru', model: 'Outback Touring', year: 2022, price: 32900, mileage: 15800,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Crystal White', condition: 'Used', location: 'Houston, TX',
    vin: '4S4BTANC4N3140279', images: photos('photo-1519245659620-e859806a8d3b', 'photo-1511919884226-fd3cad34687c'),
    features: ['Symmetrical AWD', 'EyeSight Safety', 'Heated Seats', 'Harmon Kardon Audio', 'Power Tailgate', '360 Camera', 'Nav System'],
    description: 'Top-trim Touring Outback with ventilated seats, Harman Kardon audio and the full EyeSight driver-assist suite. AWD confidence for all seasons, with station-wagon practicality.',
    seller: { name: 'Bayou Subaru', email: 'subaru@bayousubaru.com', phone: '(713) 555-0159' }
  },
  {
    make: 'Volkswagen', model: 'Golf GTI', year: 2020, price: 24900, mileage: 31200,
    bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'FWD',
    color: 'Tornado Red', condition: 'Used', location: 'Austin, TX',
    vin: '3VW447AU2LM023847', images: photos('photo-1533473359331-0135ef1b58bf', 'photo-1493238792000-8113da705763'),
    features: ['Manual Transmission', 'LSD', 'Sport Seats', 'Apple CarPlay', 'Adaptive Cruise', 'Push Start', 'HID Headlights'],
    description: 'The perennial hot-hatch benchmark with the 6-speed manual. Tornado Red, tartan seats, plenty of practicality and an enormous grin-to-dollar ratio. Well maintained.',
    seller: { name: 'Hill Country Auto', email: 'info@hillcountryauto.com', phone: '(512) 555-0188' }
  },
  {
    make: 'Kia', model: 'Telluride SX', year: 2023, price: 44500, mileage: 8200,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Everlasting Silver', condition: 'Used', location: 'Dallas, TX',
    vin: '5XYP5DGC4PG428301', images: photos('photo-1511919884226-fd3cad34687c', 'photo-1542282088-fe8426682b8f'),
    features: ['3-Row Seating', 'AWD', 'Heated & Ventilated Seats', 'Harman Kardon Audio', 'Head-Up Display', 'Adaptive Cruise', 'Panoramic Roof'],
    description: 'Practically new Telluride SX with 8,200 miles. Three rows of family hauling, luxury-car comfort, and every safety feature Kia offers. Remaining full warranty.',
    seller: { name: 'Dallas Prestige Auto', email: 'sales@dallasprestige.com', phone: '(214) 555-0171' }
  },
  {
    make: 'Lexus', model: 'ES 350', year: 2019, price: 29200, mileage: 34800,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Eminent White', condition: 'Used', location: 'Houston, TX',
    vin: '58ABK1GG6KU104577', images: photos('photo-1555215695-3004980ad54e', 'photo-1542362567-b07e54358753'),
    features: ['Lexus Safety System', 'Leather', 'Heated & Ventilated Seats', 'Mark Levinson Audio', 'Panoramic Roof', 'Apple CarPlay'],
    description: 'Reliability legend with a whisper-quiet cabin. This ES 350 has the Mark Levinson audio and ventilated seats. Lexus Certified-eligible, two owners, immaculate records.',
    seller: { name: 'Gulf Coast Lexus', email: 'cp@ulfcoastlexus.com', phone: '(281) 555-0144' }
  },
  {
    make: 'RAM', model: '1500 Big Horn', year: 2021, price: 39900, mileage: 27000,
    bodyType: 'Truck', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: '4WD',
    color: 'Flame Red', condition: 'Used', location: 'San Antonio, TX',
    vin: '1C6SRFFT0MN523710', images: photos('photo-1568605114967-8130f3a36994', 'photo-1502161254066-6c74afbf07aa'),
    features: ['5.7L HEMI V8', '4WD', '12" Touchscreen', 'Leather', 'Heated Seats', 'Tow Package', 'Air Suspension'],
    description: 'Big Horn with the 5.7L HEMI and the massive 12-inch touchscreen. Air suspension, leather, and every tow option ticked. Drives like a luxury sedan with the utility of a truck.',
    seller: { name: 'Alamo RAM', email: 'trucks@alamoram.com', phone: '(210) 555-0166' }
  },
  {
    make: 'Ford', model: 'Mustang GT', year: 2022, price: 41500, mileage: 13500,
    bodyType: 'Coupe', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'RWD',
    color: 'Grabber Blue', condition: 'Used', location: 'Dallas, TX',
    vin: '1FA6P8CF5N5156729', images: photos('photo-1494976388531-d1058494cdd8', 'photo-1502877338535-766e1452684a'),
    features: ['5.0L V8 (460 HP)', '6-Speed Manual', 'Performance Pack', 'Active Exhaust', 'Recaro Seats', 'Brembo Brakes'],
    description: 'Grabber Blue GT with the Performance Package and active exhaust. 460 horsepower, a proper 6-speed manual, and Brembo brakes. American icon, barely broken in.',
    seller: { name: 'North Texas Auto', email: 'sales@northtexasauto.com', phone: '(972) 555-0193' }
  },
  {
    make: 'Honda', model: 'CR-V EX', year: 2021, price: 27400, mileage: 21000,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Modern Steel', condition: 'Used', location: 'Austin, TX',
    vin: '7FARW1H8XME142387', images: photos('photo-1511919884226-fd3cad34687c', 'photo-1549399542-7e3f8b79c341'),
    features: ['AWD', 'Honda Sensing', 'Power Tailgate', 'Heated Seats', 'Apple CarPlay', 'Android Auto', 'Roof Rails'],
    description: 'The sensible-choice crossover with AWD and Honda Sensing. One owner, 21,000 miles, clean title, and genuinely fun to drive for its class.',
    seller: { name: 'Metro Honda', email: 'inventory@metrohonda.com', phone: '(214) 555-0176' }
  },
  {
    make: 'Tesla', model: 'Model Y Long Range', year: 2020, price: 37900, mileage: 26500,
    bodyType: 'SUV', fuelType: 'Electric', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Midnight Silver', condition: 'Used', location: 'Houston, TX',
    vin: '5YJYGDEE1LF058271', images: photos('photo-1617788138017-80ad40651399', 'photo-1619767886558-efdc259cde1a'),
    features: ['Dual Motor AWD', 'Autopilot', 'Glass Roof', 'Heated Seats', '330 mi Range', 'Towing Capable', 'Fast Charging'],
    description: 'Dual-motor Model Y with Autopilot and AWD. 26500 miles, garage kept, excellent battery health (93%). Perfect electric family SUV with room for everything.',
    seller: { name: 'Hill Country EVs', email: 'hello@hillcountryevs.com', phone: '(512) 555-0167' }
  },

  // ===== Karachi, Pakistan listings =====
  {
    make: 'Toyota', model: 'Corolla GLi', year: 2019, price: 14500, mileage: 42000,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'FWD',
    color: 'Pearl White', condition: 'Used', location: 'Clifton, Karachi',
    vin: 'NHTC33BE2K5012784', images: photos('photo-1555215695-3004980ad54e', 'photo-1542362567-b07e54358753'),
    features: ['Power Windows', 'Power Steering', 'ABS', 'Backup Camera', 'Bluetooth', 'Air Conditioning', 'Keyless Entry'],
    description: 'One-owner 2019 Toyota Corolla GLi in excellent condition. Regular oil changes at Toyota Karachi. Extremely fuel-efficient and reliable — the most popular sedan in Pakistan for a reason. Clean叻document, no accident history.',
    seller: { name: 'Port Grand Motors', email: 'sales@portgrandmotors.pk', phone: '+92 21 3566 1234' }
  },
  {
    make: 'Honda', model: 'Civic VTi Oriel', year: 2020, price: 18900, mileage: 35000,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Crystal Black', condition: 'Used', location: 'DHA Phase 5, Karachi',
    vin: 'SHHFK2360LU504189', images: photos('photo-1542362567-b07e54358753', 'photo-1555215695-3004980ad54e'),
    features: ['Sunroof', 'Leather Seats', 'Navigation', 'Backup Camera', 'Honda Sensing', 'Bluetooth', 'Cruise Control', 'Paddle Shifters'],
    description: 'Top-of-the-line Civic VTi Oriel with sunroof and leather. Driven mostly on Shahrah-e-Faisal for daily commute. Well-maintained, single owner, all Honda dealership service records available.',
    seller: { name: 'Clifton Auto Gallery', email: 'info@cliftonautogallery.pk', phone: '+92 21 3587 4567' }
  },
  {
    make: 'Suzuki', model: 'Cultus VXL', year: 2021, price: 8200, mileage: 28000,
    bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'FWD',
    color: 'Cerulean Blue', condition: 'Used', location: 'Gulshan-e-Iqbal, Karachi',
    vin: 'JS2JBABC2V6103491', images: photos('photo-1533473359331-0135ef1b58bf', 'photo-1493238792000-8113da705763'),
    features: ['Power Windows', 'Air Conditioning', 'Bluetooth', 'USB Charging', 'ABS', 'Airbag', 'Keyless Entry'],
    description: 'VXL trim Cultus with the new K-series engine. Outstanding fuel economy in Karachi traffic. Perfect first car or daily commuter. All documents clear, token paid up to 2026.',
    seller: { name: 'Sindh Auto Sales', email: 'sindhautosales@gmail.com', phone: '+92 21 3481 7890' }
  },
  {
    make: 'Suzuki', model: 'Mehran VX', year: 2017, price: 4800, mileage: 65000,
    bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'RWD',
    color: 'Super White', condition: 'Used', location: 'Nazimabad, Karachi',
    vin: 'JS2MB11A3H4102835', images: photos('photo-1494976388531-d1058494cdd8', 'photo-1493238792000-8113da705763'),
    features: ['Air Conditioning', 'Power Steering', 'USB Port'],
    description: 'Pakistan\'s most iconic car — the Suzuki Mehran. Simple, reliable, and incredibly cheap to maintain. Ideal for Karachi\'s narrow streets and tight parking. Mechanically sound with recent engine overhaul.',
    seller: { name: 'B Saddar Motors', email: 'bsaddar.motors@gmail.com', phone: '+92 21 3456 1122' }
  },
  {
    make: 'Kia', model: 'Sportage AWD', year: 2022, price: 24500, mileage: 18000,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Snow White Pearl', condition: 'Used', location: 'Bahria Town, Karachi',
    vin: 'U5YPB81ABBNL508234', images: photos('photo-1511919884226-fd3cad34687c', 'photo-1542282088-fe8426682b8f'),
    features: ['Panoramic Sunroof', 'Leather Seats', 'Ventilated Seats', '10.25" Touchscreen', 'Wireless Charging', 'Lane Keep Assist', 'Blind Spot Monitor', 'Dual Zone Climate'],
    description: 'The Kia Sportage has taken Karachi by storm. This AWD variant with panoramic roof is loaded with features. Bought from Kia Lucky Motors, under complete warranty. Impeccable interior, non-smoker owner.',
    seller: { name: 'Bahria Auto Hub', email: 'bahriaautohub@gmail.com', phone: '+92 21 3725 3344' }
  },
  {
    make: 'Toyota', model: 'Fortuner Sigma 4', year: 2021, price: 38500, mileage: 22000,
    bodyType: 'SUV', fuelType: 'Diesel', transmission: 'Automatic', drivetrain: '4WD',
    color: 'Phantom Brown', condition: 'Used', location: 'Defence Phase 8, Karachi',
    vin: 'JTEBUBFJ50K304567', images: photos('photo-1519245659620-e859806a8d3b', 'photo-1568605114967-8130f3a36994'),
    features: ['4x4', 'Diesel Turbo', 'Crawl Control', 'Multi-Terrain Select', 'Leather Seats', 'Sunroof', 'Power Tailgate', 'TRC', 'VSC', 'Hill Assist'],
    description: 'The king of Pakistani roads — Toyota Fortuner Sigma 4 in diesel. Low mileage for its age, driven carefully in Defence. Complete Toyota Indus service history. Ideal for Karachi-to-Islamabad highway trips.',
    seller: { name: 'Defence Premium Cars', email: 'defencepremium@gmail.com', phone: '+92 21 3584 5566' }
  },
  {
    make: 'Hyundai', model: 'Tucson AWD', year: 2022, price: 27500, mileage: 15000,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
    color: 'Amazon Gray', condition: 'Used', location: 'Gulshan-e-Hadeed, Karachi',
    vin: 'TMAJ38F3XKJ503921', images: photos('photo-1549399542-7e3f8b79c341', 'photo-1511919884226-fd3cad34687c'),
    features: ['Panoramic Roof', 'Heated Seats', 'Blind Spot Monitor', 'Lane Follow Assist', 'Smart Cruise Control', 'Wireless Apple CarPlay', 'LED Headlights', 'Power Tailgate'],
    description: 'Hyundai Tucson has become extremely popular in Karachi since its launch. This 2022 model is loaded with every option. Still under Hyundai Nishat warranty. Smooth ride, excellent for family use.',
    seller: { name: 'Hyundai Hub Karachi', email: 'hyundaikhi@gmail.com', phone: '+92 21 3636 7788' }
  },
  {
    make: 'Suzuki', model: 'Swift GLX', year: 2022, price: 9500, mileage: 12000,
    bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Criminal Red', condition: 'Used', location: 'PECHS, Karachi',
    vin: 'JS2JBABC4V6108745', images: photos('photo-1544636331-e26879cd4d9b', 'photo-1533473359331-0135ef1b58bf'),
    features: ['Automatic Transmission', 'Touchscreen', 'Bluetooth', 'Cruise Control', 'Push Start', 'Keyless Entry', 'Airbag', 'ABS'],
    description: 'The new-gen Suzuki Swift GLX automatic. Sporty looks, peppy engine, and excellent fuel economy. Perfect for Karachi traffic with its automatic gearbox. Almost new condition, barely driven.',
    seller: { name: 'PECHS Auto Mart', email: 'pechsautomart@gmail.com', phone: '+92 21 3453 9900' }
  },
  {
    make: 'Honda', model: 'City 1.5L CVT', year: 2020, price: 13200, mileage: 38000,
    bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Taffeta White', condition: 'Used', location: 'North Nazimabad, Karachi',
    vin: 'SANK33A32L7503489', images: photos('photo-1541899481282-d53bffe3c35d', 'photo-1493238792000-8113da705763'),
    features: ['CVT Automatic', 'Touchscreen', 'Bluetooth', 'Rear Camera', 'Air Conditioning', 'Power Windows', 'Dual Airbags', 'ABS with EBD'],
    description: 'Honda City 1.5L CVT — the perfect blend of comfort and fuel efficiency. Extremely popular in Karachi for its smooth CVT transmission in stop-and-go traffic. Single owner, Honda NHC service history.',
    seller: { name: 'Nazimabad Motors', email: 'nazimabadmotors@gmail.com', phone: '+92 21 3663 2211' }
  },
  {
    make: 'Toyota', model: 'Hilux Revo G', year: 2021, price: 29800, mileage: 30000,
    bodyType: 'Truck', fuelType: 'Diesel', transmission: 'Automatic', drivetrain: '4WD',
    color: 'Attitude Black', condition: 'Used', location: 'Surjani Town, Karachi',
    vin: 'MR0KB3CD60K009876', images: photos('photo-1568605114967-8130f3a36994', 'photo-1502161254066-6c74afbf07aa'),
    features: ['4x4 Diesel', 'Automatic', 'Touchscreen', 'Bluetooth', 'Rear Differential Lock', 'Trailer Sway Control', 'Hill Start Assist', 'Side Steps'],
    description: 'Toyota Hilux Revo G — the workhorse of Pakistan. Diesel automatic, perfect for both city driving and trips to Northern areas. Well-maintained with Toyota Indus service records. Bed liner included.',
    seller: { name: 'KhiTrucks Sales', email: 'khitrucks@gmail.com', phone: '+92 21 3690 4455' }
  },
  {
    make: 'Daihatsu', model: 'Cuore EX', year: 2018, price: 5200, mileage: 52000,
    bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'FWD',
    color: 'Silky Silver', condition: 'Used', location: 'Orangi Town, Karachi',
    vin: 'B3A1000036482', images: photos('photo-1493238792000-8113da705763', 'photo-1494976388531-d1058494cdd8'),
    features: ['Air Conditioning', 'Power Steering', 'USB Port', 'CD Player'],
    description: 'Budget-friendly Daihatsu Cuore — perfect city runabout for Karachi. Incredibly cheap to run and maintain. New tires, recent oil change. Ideal as a first car or daily commuter.',
    seller: { name: 'B Saddar Motors', email: 'bsaddar.motors@gmail.com', phone: '+92 21 3456 1122' }
  },
  {
    make: 'MG', model: 'HS 1.5T', year: 2022, price: 21500, mileage: 10000,
    bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'FWD',
    color: 'Glacier White', condition: 'Used', location: 'DHA Phase 6, Karachi',
    vin: 'LSJA24U96N0056789', images: photos('photo-1549399542-7e3f8b79c341', 'photo-1542282088-fe8426682b8f'),
    features: ['Panoramic Sunroof', 'Leather Seats', '10.1" Touchscreen', '360 Camera', 'ADAS Suite', 'Wireless Charging', 'Bose Audio', 'Ambient Lighting'],
    description: 'MG HS has disrupted the Pakistani SUV market with premium features at a competitive price. This fully loaded 1.5T variant has panoramic roof and ADAS. Under MG warranty, barely a year old.',
    seller: { name: 'MG Showroom Karachi', email: 'mgkarachi@gmail.com', phone: '+92 21 3529 8877' }
  },
  {
    make: 'Suzuki', model: 'Bolan VX', year: 2020, price: 5800, mileage: 45000,
    bodyType: 'Van', fuelType: 'Gasoline', transmission: 'Manual', drivetrain: 'RWD',
    color: 'Super White', condition: 'Used', location: 'SITE Area, Karachi',
    vin: 'JS3TB23SXL4105678', images: photos('photo-1502161254066-6c74afbf07aa', 'photo-1568605114967-8130f3a36994'),
    features: ['Rear AC Vents', 'Seatbelts', 'Sliding Doors'],
    description: 'Suzuki Bolan — the backbone of Karachi\'s commercial transport. Used but mechanically sound, perfect for goods delivery or family use. Recently serviced with new clutch plates.',
    seller: { name: 'SITE Auto Market', email: 'siteautomarket@gmail.com', phone: '+92 21 3257 3344' }
  }
];

export function seed(force = false) {
  migrate();
  const count = db.prepare('SELECT COUNT(*) AS c FROM listings').get().c;
  if (count > 0 && !force) {
    console.log(`DB already has ${count} listings — skipping seed (use --force to reseed).`);
    return;
  }
  if (count > 0) { db.exec('DELETE FROM listings; DELETE FROM sqlite_sequence WHERE name="listings";'); }

  const insert = prepare(`
    INSERT INTO listings
      (title, description, make, model, year, price, mileage, body_type, fuel_type,
       transmission, drivetrain, color, condition, location, vin, features, images,
       seller_name, seller_email, seller_phone, edit_token)
    VALUES
      (@title, @description, @make, @model, @year, @price, @mileage, @bodyType, @fuelType,
       @transmission, @drivetrain, @color, @condition, @location, @vin, @features, @images,
       @sellerName, @sellerEmail, @sellerPhone, @editToken)
  `);

  db.exec('BEGIN');
  try {
    for (const c of cars) {
      insert.run({
        title: `${c.year} ${c.make} ${c.model}`,
        description: c.description,
        make: c.make,
        model: c.model,
        year: c.year,
        price: c.price,
        mileage: c.mileage,
        bodyType: c.bodyType,
        fuelType: c.fuelType,
        transmission: c.transmission,
        drivetrain: c.drivetrain,
        color: c.color,
        condition: c.condition,
        location: c.location,
        vin: c.vin,
        features: JSON.stringify(c.features),
        images: JSON.stringify(c.images),
        sellerName: c.seller.name,
        sellerEmail: c.seller.email,
        sellerPhone: c.seller.phone,
        editToken: randomBytes(16).toString('hex')
      });
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  console.log(`Seeded ${cars.length} listings.`);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  seed(process.argv.includes('--force'));
}
