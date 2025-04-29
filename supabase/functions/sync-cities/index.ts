
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Third-party API details
const THIRD_PARTY_API_URL = Deno.env.get("THIRD_PARTY_API_URL") ?? "https://pssuodwfdpwljbnfcanz.supabase.co";
const THIRD_PARTY_API_KEY = Deno.env.get("THIRD_PARTY_API_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzc3VvZHdmZHB3bGpibmZjYW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjI3NjAsImV4cCI6MjA1OTE5ODc2MH0._rEFKaQEs7unu8VtCuAkjpCmRSeeTwrqx689LrlyhQA";

// Initialize third-party Supabase client
const thirdPartyClient = createClient(THIRD_PARTY_API_URL, THIRD_PARTY_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive list of Indian cities, towns and villages
// This is a very extensive list of Indian locations including major cities and smaller towns
const indianLocations = [
  // States and Union Territories
  { state: "Andhra Pradesh", cities: ["Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Kadapa", "Anantapur", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam", "Adoni", "Tenali", "Proddatur", "Chittoor", "Hindupur", "Srikakulam", "Bhimavaram", "Madanapalle", "Guntakal", "Dharmavaram"] },
  { state: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Aalo", "Tezu", "Roing", "Namsai", "Changlang", "Seppa", "Daporijo", "Yingkiong", "Anini", "Hawai", "Basar", "Longding", "Koloriang", "Tuting"] },
  { state: "Assam", cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar", "Goalpara", "Diphu", "North Lakhimpur", "Dhubri", "Duliajan", "Kokrajhar", "Golaghat", "Barpeta", "Mangaldoi", "Lanka", "Lumding", "Sonari", "Mariani", "Hojai", "Namrup"] },
  { state: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Purnia", "Katihar", "Munger", "Chapra", "Saharsa", "Hajipur", "Dehri", "Siwan", "Motihari", "Nawada", "Bagaha", "Buxar", "Kishanganj", "Sitamarhi", "Aurangabad", "Jamalpur", "Jehanabad", "Madhubani"] },
  { state: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur", "Ambikapur", "Chirmiri", "Dhamtari", "Mahasamund", "Dalli-Rajhara", "Naila Janjgir", "Tilda Neora", "Kawardha", "Bhatapara", "Kanker", "Dongargarh", "Bijapur", "Pakhanjur", "Kondagaon", "Baikunthpur", "Tifra", "Korea"] },
  { state: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Cuncolim", "Valpoi", "Quepem", "Canacona", "Pernem", "Sanguem", "Mormugao", "Aldona", "Chinchinim", "Benaulim", "Calangute", "Candolim", "Anjuna", "Arambol", "Morjim", "Chapora", "Colva", "Majorda"] },
  { state: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Gandhidham", "Bharuch", "Morbi", "Surendranagar", "Porbandar", "Navsari", "Mehsana", "Veraval", "Bhuj", "Godhra", "Palanpur", "Valsad", "Patan", "Amreli", "Dahod", "Botad"] },
  { state: "Haryana", cities: ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Kurukshetra", "Sirsa", "Bhiwani", "Bahadurgarh", "Jind", "Thanesar", "Kaithal", "Rewari", "Palwal", "Hansi", "Narnaul", "Fatehabad", "Gohana", "Tohana", "Charkhi Dadri", "Narwana"] },
  { state: "Himachal Pradesh", cities: ["Shimla", "Mandi", "Solan", "Dharamshala", "Baddi", "Nahan", "Hamirpur", "Una", "Kullu", "Palampur", "Paonta Sahib", "Bilaspur", "Chamba", "Kangra", "Theog", "Parwanoo", "Nurpur", "Rajgarh", "Arki", "Joginder Nagar", "Sunni", "Ghumarwin", "Rewalsar", "Kasauli", "Bakloh", "Dalhousie"] },
  { state: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh", "Medininagar", "Chirkunda", "Gumla", "Dumka", "Madhupur", "Chatra", "Chaibasa", "Phusro", "Sahibganj", "Lohardaga", "Simdega", "Godda", "Koderma", "Garhwa", "Mihijam", "Pakur", "Khunti", "Jhumri Tilaiya"] },
  { state: "Karnataka", cities: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga", "Tumkur", "Raichur", "Bidar", "Hassan", "Robertson Pet", "Udupi", "Hospet", "Bagalkot", "Gadag", "Chitradurga", "Kolar", "Mandya", "Chikmagalur", "Gangavati", "Ranebennur", "Haveri"] },
  { state: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Kannur", "Kottayam", "Kasaragod", "Malappuram", "Pathanamthitta", "Idukki", "Wayanad", "Cherthala", "Kalamassery", "Koyilandy", "Thaliparamba", "Thodupuzha", "Guruvayur", "Vatakara", "Payyanur", "Perinthalmanna", "Nedumangad", "Neyyattinkara", "Tirurangadi"] },
  { state: "Madhya Pradesh", cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Morena", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur", "Hoshangabad"] },
  { state: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Ulhasnagar", "Sangli", "Malegaon", "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Ichalkaranji", "Jalna", "Ambarnath", "Bhusawal", "Panvel", "Badlapur", "Beed"] },
  { state: "Manipur", cities: ["Imphal", "Thoubal", "Kakching", "Ukhrul", "Jiribam", "Lilong", "Churachandpur", "Mayang Imphal", "Bishnupur", "Moirang", "Nambol", "Moreh", "Kangpokpi", "Yairipok", "Sugnu", "Samurou", "Wangjing", "Ningthoukhong", "Oinam", "Kumbi", "Kwakta", "Lamlai", "Sekmai Bazar", "Senapati", "Saikul", "Tamenglong"] },
  { state: "Meghalaya", cities: ["Shillong", "Tura", "Jowai", "Baghmara", "Nongstoin", "Resubelpara", "Williamnagar", "Nongpoh", "Mawlai", "Madanrting", "Cherrapunji", "Lawsohtun", "Mawroh", "Mairang", "Umlyngka", "Nongthymmai", "Pynthorumkhrah", "Dawki", "Laitumkhrah", "Pynursla", "Khliehriat", "Lad Rymbai", "Umpling", "Mawiong", "Mawsynram"] },
  { state: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai", "Saiha", "Kolasib", "Serchhip", "Lawngtlai", "Saitual", "Khawzawl", "Mamit", "Zawlnuam", "Biate", "Vairengte", "Thenzawl", "Tlabung", "Darlawn", "North Vanlaiphai", "Khawhai", "Bairabi", "Hnahthial", "Lengpui", "Buarpui", "Hliappui", "Phullen", "Bualpui"] },
  { state: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Zunheboto", "Tuensang", "Mon", "Phek", "Kiphire", "Longleng", "Peren", "Noklak", "Tseminyu", "Chumoukedima", "Niuland", "Chiephobozou", "Meluri", "Pfutsero", "Jalukie", "Aboi", "Tizit", "Medziphema", "Mangkolemba", "Changtongya", "Longkhim"] },
  { state: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda", "Jeypore", "Barbil", "Bargarh", "Paradip", "Jajpur", "Bhawanipatna", "Dhenkanal", "Kendujhar", "Rayagada", "Sundargarh", "Balangir", "Koraput", "Angul", "Brajarajnagar", "Sonepur", "Phulbani"] },
  { state: "Punjab", cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur", "Mohali", "Pathankot", "Moga", "Firozpur", "Batala", "Khanna", "Abohar", "Malerkotla", "Barnala", "Rajpura", "Fazilka", "Phagwara", "Gurdaspur", "Sangrur", "Kapurthala", "Faridkot", "Muktsar", "Nawanshahr", "Tarn Taran", "Jagraon"] },
  { state: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar", "Pali", "Sri Ganganagar", "Bharatpur", "Jhunjhunu", "Beawar", "Kishangarh", "Hanumangarh", "Banswara", "Churu", "Nagaur", "Tonk", "Sawai Madhopur", "Hindaun", "Sujangarh", "Baran", "Makrana", "Sardarshahar"] },
  { state: "Sikkim", cities: ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Nayabazar", "Singtam", "Jorethang", "Rangpo", "Melli", "Ravangla", "Chungthang", "Yuksom", "Soreng", "Rongli", "Majhitar", "Dentam", "Daramdin", "Lachen", "Lachung", "Rinchenpong", "Kaluk", "Kabi", "Dzongu", "Rhenock", "Pakyong"] },
  { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukkudi", "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur", "Udhagamandalam", "Hosur", "Nagercoil", "Kancheepuram", "Kumarapalayam", "Karaikkudi", "Neyveli", "Cuddalore", "Kumbakonam", "Tiruvannamalai", "Pollachi"] },
  { state: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Siddipet", "Suryapet", "Miryalaguda", "Jagtial", "Mancherial", "Bhongir", "Vikarabad", "Jangaon", "Bodhan", "Sangareddy", "Medak", "Narayanpet", "Wanaparthy", "Kothagudem", "Gadwal", "Tandur", "Nirmal"] },
  { state: "Tripura", cities: ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Belonia", "Khowai", "Teliamura", "Sonamura", "Sabroom", "Amarpur", "Ambassa", "Kamalpur", "Bishalgarh", "Mohanpur", "Melaghar", "Santir Bazar", "Kumarghat", "Panisagar", "Jampuijala", "Boxanagar", "Pratapgarh", "Kathalia", "Amarpur", "Rajnagar", "Kakraban"] },
  { state: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Loni", "Jhansi", "Muzaffarnagar", "Mathura", "Shahjahanpur", "Rampur", "Ayodhya", "Vrindavan", "Bulandshahr", "Amroha", "Hardoi", "Fatehpur"] },
  { state: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Rishikesh", "Roorkee", "Kashipur", "Haldwani", "Rudrapur", "Jaspur", "Pithoragarh", "Ramnagar", "Kichha", "Kotdwara", "Manglaur", "Sitarganj", "Bageshwar", "Pauri", "Tehri", "Khatima", "Almora", "Srinagar", "Chamoli", "Mussoorie", "Nainital", "Champawat", "Uttarkashi", "Vikasnagar"] },
  { state: "West Bengal", cities: ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Jalpaiguri", "Kharagpur", "Barasat", "Kalyani", "Balurghat", "Bidhan Nagar", "Haldia", "Bankura", "Purulia", "Krishnanagar", "Nabadwip", "Medinipur", "Cooch Behar", "Darjeeling", "Howrah", "Alipurduar", "Ranaghat", "Bolpur"] },
  { state: "Andaman and Nicobar Islands", cities: ["Port Blair", "Havelock Island", "Neil Island", "Car Nicobar", "Diglipur", "Mayabunder", "Rangat", "Little Andaman", "Campbell Bay", "Wimberlygunj", "Bamboo Flat", "Garacharma", "Ferrargunj", "Kadamtala", "Billiground", "Hut Bay", "Kamorta", "Nancowry", "Teressa", "Katchal", "Chouldari", "Prothrapur", "Jungli Ghat", "Sippighat", "Austinabad"] },
  { state: "Chandigarh", cities: ["Chandigarh", "Mani Majra", "Bahlana", "Dhanas", "Daria", "Kishangarh", "Maloya", "Mauli Jagran", "Palsora", "Hallomajra", "Dadu Majra", "Behlana", "Makhan Majra", "Kaimbwala", "Khuda Ali Sher", "Khuda Jassu", "Khuda Lahora", "Sarangpur", "Burail", "Attawa", "Badheri", "Buterla", "Kajheri", "Ram Darbar", "Maloya"] },
  { state: "Dadra and Nagar Haveli and Daman and Diu", cities: ["Daman", "Diu", "Silvassa", "Dadra", "Naroli", "Khanvel", "Amli", "Vapi", "Kachigam", "Dunetha", "Dabhel", "Bhimpore", "Nani Daman", "Moti Daman", "Ghoghla", "Fudam", "Vanakbara", "Bucharwada", "Kadaiya", "Kunta", "Rakholi", "Samarvarni", "Surangi", "Velugam", "Dadra"] },
  { state: "Delhi", cities: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Shahdara", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Old Delhi", "Connaught Place", "Karol Bagh", "Hauz Khas", "Saket", "Dwarka", "Rohini", "Pitampura", "Janakpuri", "Laxmi Nagar", "Mayur Vihar", "Punjabi Bagh", "Rajouri Garden", "Vasant Kunj", "Greater Kailash"] },
  { state: "Jammu and Kashmir", cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Sopore", "Udhampur", "Poonch", "Pulwama", "Kupwara", "Ganderbal", "Budgam", "Bandipora", "Shopian", "Kulgam", "Reasi", "Doda", "Ramban", "Kishtwar", "Handwara", "Tral", "Awantipora", "Pahalgam", "Qazigund", "Uri", "Banihal"] },
  { state: "Ladakh", cities: ["Leh", "Kargil", "Nubra", "Zanskar", "Drass", "Khalsi", "Diskit", "Hanle", "Padum", "Khaltse", "Sankoo", "Nyoma", "Turtuk", "Skurbuchan", "Saspol", "Chuchot", "Achinathang", "Choglamsar", "Sumda", "Temisgam", "Lamayuru", "Wakha", "Hemis", "Thiksey", "Shey"] },
  { state: "Lakshadweep", cities: ["Kavaratti", "Agatti", "Amini", "Andrott", "Bangaram", "Bitra", "Chetlat", "Kadmat", "Kalpeni", "Kiltan", "Minicoy", "Suheli"] },
  { state: "Puducherry", cities: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai", "Villianur", "Ariyankuppam", "Madagadipet", "Nettapakkam", "Thirubhuvanai", "Bahour", "Kottucherry", "Nedungadu", "Thirunallar", "Neravy", "Tirumalarajanpattinam", "Palloor", "Chalakara", "Dariyalatippa", "Kurumbapet", "Thattanchavady", "Muthialpet", "Kalapet", "Kirumampakkam", "Lawspet"] }
];

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting city synchronization");
    
    // First, try to fetch cities from third-party API
    console.log("Attempting to fetch cities from third-party API");
    let cities = [];
    try {
      const { data: thirdPartyCities, error: thirdPartyError } = await thirdPartyClient
        .from("cities")
        .select("*");
        
      if (thirdPartyError) {
        console.warn(`Warning: Failed to fetch cities from third-party API: ${thirdPartyError.message}`);
        console.log("Will use internal Indian locations list instead");
      } else if (thirdPartyCities && thirdPartyCities.length > 0) {
        console.log(`Successfully fetched ${thirdPartyCities.length} cities from third-party API`);
        cities = thirdPartyCities.map(city => ({
          city_id: city.city_id || city.id || `CITY${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          name: city.name,
          state: city.state,
          country: "India",
          is_popular: city.is_popular || false
        }));
      }
    } catch (error) {
      console.warn(`Warning: Error fetching cities from third-party API: ${error.message}`);
      console.log("Will use internal Indian locations list instead");
    }
    
    // If third-party API didn't return cities, use the comprehensive list
    if (cities.length === 0) {
      console.log("Using internal list of Indian locations");
      
      // Create a flattened list of cities from our extensive Indian locations data
      indianLocations.forEach(state => {
        state.cities.forEach(cityName => {
          const cityId = `${cityName.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`;
          cities.push({
            city_id: cityId,
            name: cityName,
            state: state.state,
            country: "India",
            is_popular: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Goa"].includes(cityName)
          });
        });
      });
      
      console.log(`Processed ${cities.length} cities from internal list`);
    }
    
    // Process cities in batches to avoid rate limits
    const batchSize = 50;
    let totalInserted = 0;
    
    // First, clear all existing cities to remove mock data
    console.log("Clearing existing cities data");
    const { error: deleteError } = await supabaseClient.from("cities").delete().gte('id', 0);
    
    if (deleteError) {
      console.warn(`Warning when clearing cities: ${deleteError.message}`);
    }
    
    console.log("Inserting cities in batches");
    for (let i = 0; i < cities.length; i += batchSize) {
      const batch = cities.slice(i, i + batchSize);
      
      const { data, error } = await supabaseClient.from("cities").upsert(
        batch,
        { onConflict: "city_id" }
      );
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}: ${error.message}`);
        throw error;
      }
      
      totalInserted += batch.length;
      console.log(`Processed ${totalInserted} cities so far`);
    }
    
    // Now create popular routes between these cities
    const popularCities = cities.filter(city => city.is_popular);
    console.log(`Found ${popularCities.length} popular cities`);
    
    const popularRoutes = [];
    let routeId = 1;
    
    // Create routes between popular cities
    for (let i = 0; i < popularCities.length; i++) {
      for (let j = 0; j < popularCities.length; j++) {
        if (i !== j) {
          popularRoutes.push({
            route_id: `R${routeId.toString().padStart(4, '0')}`,
            from_city_id: popularCities[i].city_id,
            to_city_id: popularCities[j].city_id,
            from_city_name: popularCities[i].name,
            to_city_name: popularCities[j].name,
            is_popular: true
          });
          routeId++;
        }
      }
    }
    
    // First, clear existing routes
    console.log("Clearing existing routes data");
    const { error: deleteRoutesError } = await supabaseClient.from("routes").delete().gte('id', 0);
    
    if (deleteRoutesError) {
      console.warn(`Warning when clearing routes: ${deleteRoutesError.message}`);
    }
    
    // Insert routes
    console.log(`Inserting ${popularRoutes.length} routes`);
    if (popularRoutes.length > 0) {
      for (let i = 0; i < popularRoutes.length; i += batchSize) {
        const batch = popularRoutes.slice(i, i + batchSize);
        
        const { data, error } = await supabaseClient.from("routes").upsert(
          batch,
          { onConflict: "route_id" }
        );
        
        if (error) {
          console.error(`Error inserting routes batch ${i / batchSize + 1}: ${error.message}`);
        }
      }
      console.log(`Processed ${popularRoutes.length} routes`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synchronized ${totalInserted} cities and ${popularRoutes.length} routes` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error during city synchronization:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
