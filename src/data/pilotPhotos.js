// Configuración de fotos de pilotos F1 2025
// Usando avatares generados para cada piloto

// Import official F1 pilot photos
let officialPhotos = {};

// Load official photos from JSON file
const loadOfficialPhotos = async () => {
  try {
    const response = await fetch('/pilotos.json');
    officialPhotos = await response.json();
  } catch (error) {
    console.warn('Could not load official pilot photos:', error);
  }
};

// Initialize photos on module load
loadOfficialPhotos();

// Pilot photos configuration with official F1 photos
export const pilotPhotos = {
  // Red Bull Racing
  1: () => officialPhotos.verstappen || 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxVerstappen&backgroundColor=1e40af&clothesColor=1e40af',
  30: () => officialPhotos.lawson || 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiamLawson&backgroundColor=1e40af&clothesColor=1e40af',
  
  // Mercedes
  63: () => officialPhotos.russell || 'https://api.dicebear.com/7.x/avataaars/svg?seed=GeorgeRussell&backgroundColor=6b7280&clothesColor=6b7280',
  12: () => officialPhotos.antonelli || 'https://api.dicebear.com/7.x/avataaars/svg?seed=AndreaKimiAntonelli&backgroundColor=6b7280&clothesColor=6b7280',
  
  // Ferrari
  16: () => officialPhotos.leclerc || 'https://api.dicebear.com/7.x/avataaars/svg?seed=CharlesLeclerc&backgroundColor=dc2626&clothesColor=dc2626',
  44: () => officialPhotos.hamilton || 'https://api.dicebear.com/7.x/avataaars/svg?seed=LewisHamilton&backgroundColor=dc2626&clothesColor=dc2626',
  
  // McLaren
  4: () => officialPhotos.norris || 'https://api.dicebear.com/7.x/avataaars/svg?seed=LandoNorris&backgroundColor=f97316&clothesColor=f97316',
  81: () => officialPhotos.piastri || 'https://api.dicebear.com/7.x/avataaars/svg?seed=OscarPiastri&backgroundColor=f97316&clothesColor=f97316',
  
  // Aston Martin
  14: () => officialPhotos.alonso || 'https://api.dicebear.com/7.x/avataaars/svg?seed=FernandoAlonso&backgroundColor=059669&clothesColor=059669',
  18: () => officialPhotos.stroll || 'https://api.dicebear.com/7.x/avataaars/svg?seed=LanceStroll&backgroundColor=059669&clothesColor=059669',
  
  // Alpine
  10: () => officialPhotos.gasly || 'https://api.dicebear.com/7.x/avataaars/svg?seed=PierreGasly&backgroundColor=3b82f6&clothesColor=3b82f6',
  7: () => officialPhotos.doohan || 'https://api.dicebear.com/7.x/avataaars/svg?seed=JackDoohan&backgroundColor=3b82f6&clothesColor=3b82f6',
  
  // Racing Bulls
  22: () => officialPhotos.tsunoda || 'https://api.dicebear.com/7.x/avataaars/svg?seed=YukiTsunoda&backgroundColor=7c3aed&clothesColor=7c3aed',
  6: () => officialPhotos.hadjar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=IsackHadjar&backgroundColor=7c3aed&clothesColor=7c3aed',
  
  // Williams
  23: () => officialPhotos.albon || 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexanderAlbon&backgroundColor=1d4ed8&clothesColor=1d4ed8',
  55: () => officialPhotos.sainz || 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosSainz&backgroundColor=1d4ed8&clothesColor=1d4ed8',
  
  // Sauber
  27: () => officialPhotos.hulkenberg || 'https://api.dicebear.com/7.x/avataaars/svg?seed=NicoHulkenberg&backgroundColor=10b981&clothesColor=10b981',
  5: () => officialPhotos.bortoleto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=GabrielBortoleto&backgroundColor=10b981&clothesColor=10b981',
  
  // Haas
  50: () => officialPhotos.bearman || 'https://api.dicebear.com/7.x/avataaars/svg?seed=OliverBearman&backgroundColor=ef4444&clothesColor=ef4444',
  31: () => officialPhotos.ocon || 'https://api.dicebear.com/7.x/avataaars/svg?seed=EstebanOcon&backgroundColor=ef4444&clothesColor=ef4444'
};

// Función para obtener la foto de un piloto por su número
export const getPilotPhoto = (pilotNumber) => {
  const photoFunction = pilotPhotos[pilotNumber];
  return photoFunction ? photoFunction() : 'https://api.dicebear.com/7.x/avataaars/svg?seed=DefaultPilot&backgroundColor=6b7280';
};

// Mapeo por nombre de piloto
const pilotPhotosByName = {
  // McLaren
  'Oscar Piastri': () => officialPhotos.piastri || 'https://api.dicebear.com/7.x/avataaars/svg?seed=OscarPiastri&backgroundColor=ff8c00',
  'Lando Norris': () => officialPhotos.norris || 'https://api.dicebear.com/7.x/avataaars/svg?seed=LandoNorris&backgroundColor=ff8c00',
  
  // Red Bull Racing
  'Max Verstappen': () => officialPhotos.verstappen || 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaxVerstappen&backgroundColor=1e41ff',
  'Yuki Tsunoda': () => officialPhotos.tsunoda || 'https://api.dicebear.com/7.x/avataaars/svg?seed=YukiTsunoda&backgroundColor=1e41ff',
  
  // Ferrari
  'Charles Leclerc': () => officialPhotos.leclerc || 'https://api.dicebear.com/7.x/avataaars/svg?seed=CharlesLeclerc&backgroundColor=dc143c',
  'Lewis Hamilton': () => officialPhotos.hamilton || 'https://api.dicebear.com/7.x/avataaars/svg?seed=LewisHamilton&backgroundColor=dc143c',
  
  // Mercedes
  'George Russell': () => officialPhotos.russell || 'https://api.dicebear.com/7.x/avataaars/svg?seed=GeorgeRussell&backgroundColor=00d2be',
  'Andrea Kimi Antonelli': () => officialPhotos.antonelli || 'https://api.dicebear.com/7.x/avataaars/svg?seed=AndreaAntonelli&backgroundColor=00d2be',
  
  // Aston Martin
  'Fernando Alonso': () => officialPhotos.alonso || 'https://api.dicebear.com/7.x/avataaars/svg?seed=FernandoAlonso&backgroundColor=006f62',
  'Lance Stroll': () => officialPhotos.stroll || 'https://api.dicebear.com/7.x/avataaars/svg?seed=LanceStroll&backgroundColor=006f62',
  
  // Alpine
  'Pierre Gasly': () => officialPhotos.gasly || 'https://api.dicebear.com/7.x/avataaars/svg?seed=PierreGasly&backgroundColor=0090ff',
  'Franco Colapinto': () => officialPhotos.colapinto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=FrancoColapinto&backgroundColor=0090ff',
  
  // Williams
  'Alexander Albon': () => officialPhotos.albon || 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexAlbon&backgroundColor=005aff',
  'Carlos Sainz': () => officialPhotos.sainz || 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosSainz&backgroundColor=005aff',
  
  // RB (Racing Bulls)
  'Liam Lawson': () => officialPhotos.lawson || 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiamLawson&backgroundColor=6692ff',
  'Isack Hadjar': () => officialPhotos.hadjar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=IsackHadjar&backgroundColor=6692ff',
  
  // Haas
  'Esteban Ocon': () => officialPhotos.ocon || 'https://api.dicebear.com/7.x/avataaars/svg?seed=EstebanOcon&backgroundColor=ffffff',
  'Oliver Bearman': () => officialPhotos.bearman || 'https://api.dicebear.com/7.x/avataaars/svg?seed=OliverBearman&backgroundColor=ffffff',
  
  // Kick Sauber
  'Nico Hülkenberg': () => officialPhotos.hulkenberg || 'https://api.dicebear.com/7.x/avataaars/svg?seed=NicoHulkenberg&backgroundColor=52e252',
  'Gabriel Bortoleto': () => officialPhotos.bortoleto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=GabrielBortoleto&backgroundColor=52e252'
};

// Función para obtener la foto de un piloto por su nombre
export const getPilotPhotoByName = (pilotName) => {
  const photoFunction = pilotPhotosByName[pilotName];
  return photoFunction ? photoFunction() : 'https://api.dicebear.com/7.x/avataaars/svg?seed=DefaultPilot&backgroundColor=6b7280';
};

// Función para obtener el color del equipo
export const getTeamColor = (team) => {
  const teamColors = {
    'Red Bull Racing': 'from-blue-600 to-blue-700',
    'Mercedes': 'from-gray-500 to-gray-600',
    'Ferrari': 'from-red-600 to-red-700',
    'McLaren': 'from-orange-500 to-orange-600',
    'Aston Martin': 'from-green-600 to-green-700',
    'Alpine': 'from-blue-500 to-blue-600',
    'Racing Bulls': 'from-purple-600 to-purple-700',
    'Williams': 'from-blue-700 to-blue-800',
    'Sauber': 'from-green-500 to-green-600',
    'Haas': 'from-red-500 to-red-600'
  };
  
  return teamColors[team] || 'from-gray-500 to-gray-600';
};