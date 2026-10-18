import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ==================== ALL YOUR DATA (unchanged) ==================== */
// ... (facts, countryList, countryDataHardcoded, redIcon remain exactly the same)
// Keeping all your data intact – omitted here for brevity but included in full code below

const facts = {
  "Afghanistan": "Afghanistan changed its flag a whopping 18 times during the 20th century and four more since then, with the current flag in use since 2013.",
  "Albania": "With over 173,000 concrete bunkers scattered across its land, Albania boasts nearly 15 bunkers per square mile on average.",
  "Algeria": "Though the largest country in Africa, only about 10% of Algeria is inhabitable, as the rest is covered by the Sahara Desert.",
  "Andorra": "Andorra, the largest country in the world without an airport, stands as a picturesque paradise nestled amidst the mountains.",
  "Angola": "There are more people who speak Portuguese in Angola than there are in Portugal itself.",
  "Anguilla": "Anguilla is known for its pristine beaches and coral reefs.",
  "Antarctica": "It is the coldest, windiest, and driest continent on Earth. It is home to the South Pole, and the Antarctic Treaty designates it as a scientific preserve, with no military activity allowed.",
  "Antigua and Barbuda": "Antigua and Barbuda renamed their highest point Mount Obama after the U.S. President Barack Obama, a gesture of admiration.",
  "Argentina": "Argentina is home to the world’s widest avenue, Avenida 9 de Julio, located in Buenos Aires. The country is famous for its passionate tango dance, which originated in the working-class neighborhoods of Buenos Aires.",
  "Armenia": "Chess holds a special place in Armenia's educational system, where it is a part of every child's primary school curriculum.",
  "Aruba": "Aruba was conquered and settled by the Spanish, English, and Dutch, the island has a constant breeze of 14-21 mph year round, taxis legally do not have meters, and the country has a motto of “one happy island”.",
  "Australia": "Australia boasts an astonishing 685 national parks, making it the global leader in protected natural wonders.",
  "Austria": "A quaint Austrian village, home to about 100 people, had a unique issue with its name being frequently stolen.",
  "Azerbaijan": "In Baku, Azerbaijan, you'll find the world's largest KFC outlet, spreading across a whopping 1600 square meters.",
  "Bahamas": "The Bahamas boasts a unique island inhabited solely by swimming pigs, aptly named Pig Beach, attracting curious tourists.",
  "Bahrain": "Until his passing in November 2020, the recently deceased prime minister of Bahrain held the record as the world's longest-serving prime minister, serving since 1970.",
  "Bangladesh": "Bangladesh is the most densely populated large country in the world. It packs about 3,000 people per square mile. Bangladesh is the only country in the world with country name ending in letter H.",
  "Barbados": "The Prime Minister of Barbados created \"Rihanna Day\" as a national holiday to honor the famous singer's achievements and contributions.",
  "Belarus": "Belarus once produced a TV show called \"The Theorists,\" a blatant ripoff of the popular US show \"The Big Bang Theory.\"",
  "Belgium": "Belgium held the record for the longest period without a government in 2010-2011, only to break its record in 2020.",
  "Belize": "Home to about 900 Mayan sites, including Baking Pot, Cahal Pech, and Caracol.",
  "Benin": "The flag of the Kingdom of Benin features a unique design, depicting a figure being decapitated with a sword.",
  "Bermuda": "Bermuda is famous for the Bermuda Triangle, a mysterious area where numerous ships and planes have disappeared.",
  "Bhutan": "Bhutan takes the title of the most mountainous country globally, with 98.8% of its land area covered in awe-inspiring peaks.",
  "Bolivia": "Bolivia boasts the highest capital city in the world - La Paz, situated at an elevation of 3,650 meters. Lake Titicaca, shared with Peru, is the highest navigable lake globally, nestled in the Andes Mountains.",
  "Bosnia and Herzegovina": "Bosnia and Herzegovina has the most complex political system in the world, consisting of a unitary republic, a federation of 10 cantons and a district, with 14 governments total.",
  "Botswana": "Botswana has two parliamentary constituencies called Kanye North and Kanye South, but no Kanye West.",
  "Bouvet Island": "Bouvet Island is the most remote island in the world, uninhabited and located in the South Atlantic Ocean.",
  "Brazil": "The Amazon Rainforest within Brazil provides a staggering 20% of the world’s oxygen. There are way more people who speak Portuguese in Brazil than there are in Portugal itself. Brazil is renowned for its vibrant Carnival celebrations, especially in Rio de Janeiro.",
  "British Indian Ocean Territory": "The British Indian Ocean Territory is home to the U.S. military base on Diego Garcia.",
  "British Virgin Islands": "The British Virgin Islands are a popular yachting destination with over 60 islands.",
  "Brunei": "The Sultan of Brunei resides in the world's largest residential palace, valued at a staggering $350 million.",
  "Bulgaria": "Bulgaria's Varna Necropolis holds the distinction of being home to the oldest gold treasure in the world, dating back to over 4,000 BC.",
  "Burkina Faso": "Despite its name, Burkina Faso scored only 40 out of 100 on Transparency International's Corruption Index in 2019.",
  "Burundi": "Burundi made history as the poorest country to win an Olympic gold medal when Venuste Niyongabo claimed victory in the 5,000 meters in 1996.",
  "Cambodia": "Cambodia never had a McDonald's store in the country due to the strong local food culture. There is no Burger King in Cambodia either.",
  "Cameroon": "During the Great Depression in the United States, Cameroon raised $3.77 to help the American people in a heartfelt gesture of support.",
  "Canada": "Canada boasts the world’s most lakes, totaling 879,800. Canada’s coastline stretches over 150,000 miles. Canada is the second-largest country in the world by area. The Vikings visited Canada around 1021, several hundred years before Christopher Columbus. Canada has two national sports: hockey in winter and lacrosse in summer. The Trans-Canada Highway is the fourth-longest highway globally, spanning 4,860 miles and passing through all 10 Canadian provinces. The maple leaf has been a symbol of Canada since 1806.",
  "Cape Verde": "Barack Obama once referred to Cape Verde as a real success story, praising the country's progress and achievements.",
  "Cayman Islands": "The Cayman Islands are known for their offshore banking and tax haven status.",
  "Central African Republic": "The Central African Republic and Chad are the first consecutive countries in alphabetical order that also share a border.",
  "Chad": "The Central African Republic and Chad are the first consecutive countries in alphabetical order that also share a border.",
  "Chile": "Chile is home to the driest desert on Earth, the Atacama Desert. Easter Island, a Chilean territory, is famous for its mysterious giant stone statues called moai.",
  "China": "In 2023 China was dethroned by India as world's most populous country and is now the world's 2nd most populated country. Ping pong is the most popular sport in China. China follows one single Time Zone even though it is one of the largest countries in the world by area.",
  "Christmas Island": "Christmas Island is famous for its annual red crab migration.",
  "Cocos (Keeling) Islands": "The Cocos (Keeling) Islands are an Australian territory with a population of about 600.",
  "Colombia": "Colombia produces some of the world’s finest emeralds. The Muzo mine in Colombia is renowned for its high-quality gemstones.",
  "Comoros": "The name \"Comoros\" is derived from the Arabic word for moon, reflecting the country's celestial beauty.",
  "Congo": "The capitals of the Republic of the Congo and the Democratic Republic of the Congo, Brazzaville and Kinshasa, respectively, are the closest capital cities in the world, separated only by the Congo River.",
  "Cook Islands": "The Cook Islands are a self-governing island country in free association with New Zealand.",
  "Costa Rica": "Known for stunning beaches and the Monteverde Cloud Forest Reserve.",
  "Côte d'Ivoire": "Didier Drogba, the Ivorian footballer, played a crucial role in bringing an end to a five-year civil war in his home country.",
  "Croatia": "The necktie, a fashion staple, originates from Croatia, and its name is derived from \"Croatian,\" with its distinctive designs traced back to the 17th century.",
  "Cuba": "Cuba is one of only two countries where Coca-Cola is not sold, making it a unique beverage experience for visitors.",
  "Curaçao": "Curaçao is known for its colorful Dutch colonial architecture.",
  "Cyprus": "The capital city of Cyprus, Nicosia, is famously known as the world's last remaining divided capital due to the Green Line separating its Greek and Turkish sectors.",
  "Czech Republic": "Czechia proudly holds the title of consuming the most beer per capita in the world, with an astonishing 192 liters per person annually.",
  "Czechia": "Czechia proudly holds the title of consuming the most beer per capita in the world, with an astonishing 192 liters per person annually.",
  "Denmark": "Denmark is renowned for being the least corrupt country globally, setting a high standard for transparent governance.",
  "Djibouti": "More than 70% of Djibouti's population resides in the capital city, Djibouti City, making it the de facto center of the country.",
  "Dominica": "Dominica is home to the Morne Trois Pitons National Park, a UNESCO World Heritage Site.",
  "Dominican Republic": "Known as the 'Breadbasket of the Caribbean', this nation's rich soil and tropical climate make it a prime location for producing large quantities of grain or wheat.",
  "DR Congo": "The Democratic Republic of the Congo houses the world's largest lava lake, a mesmerizing natural wonder.",
  "Ecuador": "Ecuador straddles the equator, and the Mitad del Mundo monument marks this geographical division. In 2008, Ecuador became the first country to officially recognize the rights of nature. The Galápagos Islands, part of Ecuador, inspired Charles Darwin’s theory of evolution due to their unique wildlife.",
  "Egypt": "The Nile River in Egypt is the longest river globally, stretching approximately 6,650 kilometers.",
  "El Salvador": "Has a rich history and is home to the Joya de Cerén archaeological site.",
  "Equatorial Guinea": "Equatorial Guinea has the lowest average iq. Spanish is the official language of Equatorial Guinea.",
  "Eritrea": "The elderly of Eritrea still dominantly speak Italian after living through the region’s colonial period.",
  "Estonia": "Estonia has the highest number of startups per capita in Europe.",
  "Eswatini": "Eswatini is the last absolute monarchy in Africa.",
  "Ethiopia": "Ethiopia uses a Coptic rather than Gregorian calendar and there is about a 7 year difference. Ethiopia didn't have electricity until the King ordered 3 electric chairs to execute criminals and realised he didn't have any way to use them.",
  "Falkland Islands": "The Falkland Islands have more penguins than people.",
  "Faroe Islands": "Every single settlement on the Faroe Islands is by the sea, except one.",
  "Fiji": "Fiji is home to the world's only three-hearted fish.",
  "Finland": "Finland contains 178,947 islands, 3rd most for any single country in the world.",
  "France": "France is the most visited country in Europe. Notre-Dame Cathedral in Paris is the most visited attraction in Europe, with almost 14 million yearly visitors.",
  "French Guiana": "French Guiana is an overseas department of France in South America.",
  "French Polynesia": "French Polynesia is famous for its overwater bungalows in Bora Bora.",
  "French Southern and Antarctic Lands": "The French Southern and Antarctic Lands are uninhabited except for scientists.",
  "Gabon": "Gabon has one of the highest urbanization rates in Africa.",
  "Gambia": "The Gambia has the definite article \"The\" to avoid confusion with Zambia.",
  "Georgia": "Georgia is the birthplace of wine, with evidence of wine production dating back 8,000 years.",
  "Germany": "In slavic languages, Germany is Called \"Německo, Niemcy...\" derived from \"němý\" meaning mute, because they didn't understand German.",
  "Ghana": "Ghana was the first sub-Saharan African country to gain independence from colonial rule.",
  "Gibraltar": "Gibraltar is home to the only wild monkeys in Europe.",
  "Greece": "Greece has more archaeological museums than any other country.",
  "Greenland": "Greenland is the world's largest island and has the lowest population density.",
  "Grenada": "Grenada is known as the \"Spice Island\" for its nutmeg production.",
  "Guadeloupe": "These islands are overseas territories of France and are represented in the European Union.",
  "Guam": "Guam is a U.S. territory in the Pacific with a unique Chamorro culture.",
  "Guatemala": "Guatemala is home to the first mixed UNESCO World Heritage Site, Tikal National Park, which qualifies both in natural and cultural criteria.",
  "Guernsey": "Guernsey is known for its dairy cows and financial services.",
  "Guinea": "Guinea has the world's largest bauxite reserves.",
  "Guinea-Bissau": "Guinea-Bissau's national anthem has no lyrics.",
  "Guyana": "Guyana is the only South American country where English is the official language. The Kaieteur Falls in Guyana is one of the world’s tallest single-drop waterfalls, surrounded by pristine rainforest.",
  "Haiti": "Haiti is the only country born from a successful slave revolt.",
  "Heard Island and McDonald Islands": "Heard Island and McDonald Islands are remote Australian territories with active volcanoes.",
  "Honduras": "The Mayan ruins of Copán and beautiful Caribbean beaches.",
  "Hong Kong": "Hong Kong has more skyscrapers than any other city in the world.",
  "Hungary": "Hungary is famous for its thermal baths and has the world's largest thermal lake.",
  "Iceland": "Iceland is the only country that is mosquito-free. The most probable theory about why Iceland has no mosquitoes is that the weather conditions are not favorable for mosquitoes.",
  "India": "India is now the world's most populated country and by some measures, it is also the home to most polluted cities in the world. India is the country which produces the most mangoes in the world with over 20 million tonnes of mangoes produced every year. India is the 2nd largest english speaking country in the world (and by some estimates it could also very well be the largest). This includes population with english as their second or third language. India is the largest democracy in the world. Its also the birthplace of Chess. The 10 base numeral system for writing numbers was invented by Indian mathematicians sometime between 1st and 4th century AD.",
  "Indonesia": "Indonesia is home to the largest lizard on Earth, the Komodo dragon, which can be found in the Komodo National Park. Indonesia is comprised of over 17,000 islands, about 6,000 are inhabited, making it one of the largest archipelagic state in the world. Indonesia has the largest Muslim population in the world with about 230M.",
  "Iran": "McDonald's is not allowed to operate in Iran due to its government's disapproval of Western culture.",
  "Iraq": "The ancient Sumerians of Iraq invented the world's first writing system.",
  "Ireland": "Halloween was first celebrated in Ireland. The potato blight in the 1840s led to widespread starvation and emigration in Ireland.",
  "Isle of Man": "The Isle of Man is known for its tailless Manx cats.",
  "Israel": "Israel has the highest number of museums per capita in the world.",
  "Italy": "Italian republic exists since the end of ww2. Governments should be elected every 5 years, meaning there should have been roughly 15 different governments. Instead, there have been 67.",
  "Ivory Coast": "Didier Drogba, the Ivorian footballer, played a crucial role in bringing an end to a five-year civil war in his home country.",
  "Jamaica": "Jamaica is the only country with a flag that doesn't contain red, white, or blue.",
  "Japan": "Japan has more than 6,800 islands. Japan is known for its bullet trains, which can travel up to speeds of 320 km/h. Japan has the longest life expectancy in the world with the average life expectancy for males being 80.9 years and 86.6 years for females.",
  "Jersey": "Jersey is famous for its Jersey cows and financial services.",
  "Jordan": "Jordan is home to the ancient city of Petra, a UNESCO World Heritage Site.",
  "Kazakhstan": "Kazakhstan is the world's largest landlocked country.",
  "Kenya": "Kenya is known for being the world's best safari destination, with 50 epic national parks and reserves that are home to diverse wildlife, including the Big Five – lions, leopards, elephants, rhinos and buffalo.",
  "Kiribati": "Kiribati has land in all 4 hemispheres.",
  "Kosovo": "Kosovo is the youngest country in Europe.",
  "Kuwait": "Kuwait has the world's tallest building shaped like a sail.",
  "Kyrgyzstan": "Kyrgyzstan is home to the world's longest epic poem, the Epic of Manas.",
  "Laos": "Laos is the most heavily bombed country in history.",
  "Latvia": "Latvia has the world's tallest women on average.",
  "Lebanon": "Lebanon is home to the oldest continuously inhabited city, Byblos.",
  "Lesotho": "Lesotho has the highest lowest elevation of any country in the world.",
  "Liberia": "Liberia is the only country in Africa founded by Americans.",
  "Libya": "Libya has the hottest temperature ever recorded, 58°C.",
  "Liechtenstein": "Uzbekistan and Liechtenstein are the only double landlocked countries in the world. Liechtenstein is the leading exporter of dentures and has a 100% literacy rate.",
  "Lithuania": "Lithuania has the highest suicide rates in Europe.",
  "Luxembourg": "Luxembourg's first record of existence dates back to 963 AD, making it older than modern-day England.",
  "Macau": "Macau has the highest population density in the world.",
  "Madagascar": "Madagascar is home to 90% of the world's lemur species.",
  "Malawi": "Malawi has one of the world's largest freshwater lakes, Lake Malawi.",
  "Malaysia": "The pomelo, the largest citrus fruit on the planet, is endemic to Malaysia. The Petronas Towers in Kuala Lumpur were once the tallest buildings in the world and remain the tallest twin towers.",
  "Maldives": "The Maldives is the lowest country in the world, with an average elevation of 1.5 meters.",
  "Mali": "Mali is home to the ancient city of Timbuktu.",
  "Malta": "Malta was actually the most heavily bombed country in WWII. Malta is the most bombed country (tons of high explosive per square mile) in history.",
  "Marshall Islands": "The Marshall Islands have no land animals except for rats.",
  "Martinique": "Martinique is an overseas department of France.",
  "Mauritania": "Mauritania is the last country in the world to officially abolish slavery. This happened in 1981.",
  "Mauritius": "Mauritius is home to the extinct dodo bird.",
  "Mayotte": "Mayotte is an overseas department of France in the Indian Ocean.",
  "Mexico": "Built over the ruins of Tenochtitlán, Mexico City is sinking at a rate of 6 to 8 inches per year due to its location on a lake. Mexico boasts the largest pyramid in the world, known as the Great Pyramid of Cholula. The meteor impact that wiped out the dinosaurs millions of years ago struck what is now the Yucatán Peninsula in Mexico. A Mexican engineer named Guillermo González Camarena invented the first color television system. The National Autonomous University of Mexico (UNAM) is the largest university globally in terms of enrollment. Millions of monarch butterflies migrate to and from Mexico each year, covering thousands of miles.",
  "Micronesia": "The island nation comprises over 600 islands located in Oceania. It was colonized by Spain in 1886, sold to Germany in 1899, and occupied by Japan from 1914 to 1944. Truk Lagoon in Micronesia is home to over 60 shipwrecks of Japanese warships destroyed during World War II. Micronesia is one of just 22 countries without an army; the USA provides aid and defense in return for maintaining military bases there.",
  "Moldova": "Moldova has the largest wine cellar in the world, Mileștii Mici.",
  "Monaco": "Monaco has the highest life expectancy in the world.",
  "Mongolia": "Genghis Khan, the Mongolian conqueror, killed so many ppl that he reduced the carbon emissions in the air, and had so many kids it's estimated 1 in 200 men are related to him.",
  "Montenegro": "Montenegro has the deepest canyon in Europe, Tara Canyon.",
  "Montserrat": "Montserrat is known as the \"Emerald Isle of the Caribbean\".",
  "Morocco": "The University of Al-Karaouine in Morocco is the oldest in the world.",
  "Mozambique": "Mozambique has a flag featuring an AK-47.",
  "Myanmar": "Myanmar has the longest suspension bridge made of glass.",
  "Namibia": "Namibia is named after the Namib desert, which is the oldest desert on earth. “Namibia” means “land that god created in anger” in the local language.",
  "Nauru": "Nauru is the only country with no official capital, it's the most obese country in the world and the only country with a palindromic nationality (Nauruan).",
  "Nepal": "Nepal is home to Mount Everest, the highest mountain in the world.",
  "Netherlands": "The Netherlands is the world's largest exporter of flowers.",
  "New Caledonia": "New Caledonia has the world's largest lagoon.",
  "New Zealand": "New Zealand boasts stunning landscapes, including fjords, geysers, and the famous movie set used for \"The Lord of the Rings\" movie trilogy. Snake-Free Zone - there are no snakes in New Zealand. There are more Sheeps and Cows in New Zealand than people - seven times as many sheep and three times as many cows as people. New Zealanders affectionately refer to themselves as Kiwis. Wellington, New Zealand’s capital, holds the distinction of being the southernmost national capital in the world, situated at latitude 41.2° South.",
  "Nicaragua": "Nicaragua is the only Central American country with a female president, Violeta Barrios Torres de Chamorro, who served from 1990 to 1997.",
  "Niger": "Niger has the youngest population in the world, with a median age of 15.",
  "Nigeria": "This multiethnic country is home to over 520 spoken languages among its residents. Nigeria is home to around 370 different tribes which are officially recognised worldwide.",
  "Niue": "Niue is one of the world's smallest democracies.",
  "Norfolk Island": "Norfolk Island is known for its Norfolk Pine trees.",
  "North Korea": "McDonald's is not allowed to operate in North Korea due to its government's disapproval of Western culture.",
  "North Macedonia": "North Macedonia is home to the oldest lake in Europe, Lake Ohrid.",
  "Northern Mariana Islands": "The Northern Mariana Islands are a U.S. commonwealth in the Pacific.",
  "Norway": "Norway contains 239,057 islands, 2nd most for any single country in the world. If you include its islets, this number goes up to 320,249.",
  "Oman": "Oman has the world's oldest independent state.",
  "Pakistan": "One city in Pakistan produces 40% of the world's soccer balls. Pakistan is ranked #6 in mango production.",
  "Palau": "Palau has jellyfish lakes where jellyfish don't sting.",
  "Palestine": "Palestine is home to the world's oldest city, Jericho.",
  "Panama": "Famous for the Panama Canal and lush rainforests.",
  "Papua New Guinea": "Papua New Guinea has over 800 languages spoken.",
  "Paraguay": "Paraguayans have a strong tradition of drinking tereré, a refreshing cold herbal tea served in a gourd with a metal straw. The Itaipu Dam, shared with Brazil, is one of the largest hydroelectric power plants globally.",
  "Peru": "Boasting the highest sand dune on the planet, Cerro Blanco in the Sechura Desert measures an impressive 3,860 feet from base to summit. Peru is home to the ancient Inca citadel of Machu Picchu, a UNESCO World Heritage Site and one of the New Seven Wonders of the World. It is also home to the Nazca Lines, mysterious geoglyphs etched into the desert floor, which remain an enigma.",
  "Philippines": "Puerto-Princesa Subterranean River in Palawan, Philippines is one of the longest underground rivers in the world. Philippines is made up of over 7,600 islands, making it one of the largest archipelagos in the world.",
  "Pitcairn Islands": "The Pitcairn Islands have the smallest population of any democracy.",
  "Poland": "Poland has the world's largest castle by land area, Malbork Castle.",
  "Portugal": "There are more Portuguese speaking people outside of Portugal than in Portugal itself.",
  "Puerto Rico": "The 'Island of Enchantment' is known for its pure beaches, magnificent rainforests, and stunning mountains, alongside a wide range of biological and geological diversity.",
  "Qatar": "Qatar has the world's richest citizens per capita.",
  "Réunion": "Réunion is an overseas department of France known for its volcanoes.",
  "Romania": "Romania has the world's heaviest building, the Palace of the Parliament.",
  "Russia": "Russia has 11 Time Zones. So the time difference between the east and west borders of the country is about 10 hours.",
  "Rwanda": "Rwanda has the highest percentage of women in parliament.",
  "Saint Barthélemy": "Saint Barthélemy is a luxury destination in the Caribbean.",
  "Saint Helena, Ascension and Tristan da Cunha": "Saint Helena is where Napoleon was exiled.",
  "Saint Kitts and Nevis": "Saint Kitts and Nevis is the smallest sovereign state in the Americas.",
  "Saint Lucia": "Saint Lucia is the only country named after a woman.",
  "Saint Martin": "The islands of Guadeloupe, Martinique, and Saint Martin are all overseas territories of France. All three islands use the Euro and are represented in the European Union.",
  "Saint Pierre and Miquelon": "Saint Pierre and Miquelon is the only remaining French territory in North America.",
  "Saint Vincent and the Grenadines": "Saint Vincent and the Grenadines has the world's oldest botanical garden.",
  "Samoa": "Samoa is the first country to see the new day.",
  "San Marino": "San Marino state has more than 15 \"Comuni\" towns while still being super small.",
  "Sao Tome and Principe": "Sao Tome and Principe is the second smallest African country.",
  "Saudi Arabia": "Saudi Arabia is the largest country without a river.",
  "Senegal": "Senegal has a pink lake, Lake Retba.",
  "Serbia": "Serbia has the world's most expensive cheese, Pule.",
  "Seychelles": "Seychelles has the world's heaviest land tortoise.",
  "Sierra Leone": "Sierra Leone has the world's third largest natural harbor.",
  "Singapore": "Singapore is the only country that gained independence against its will.",
  "Sint Maarten": "Sint Maarten has a beach where planes fly very low overhead.",
  "Slovakia": "Slovakia is home to one of only three aragonite caves to exist.",
  "Slovenia": "Slovenia has quite a lot of coastline to the Mediterranean sea, but only has one named island (on Lake Bled).",
  "Solomon Islands": "The Solomon Islands have over 900 islands.",
  "Somalia": "Somalia has the longest coastline in Africa.",
  "South Africa": "South Africa is rich in natural resources, including gold, diamonds, oil, and gas.",
  "South Georgia": "South Georgia is home to massive penguin colonies.",
  "South Korea": "South Korea has the lowest fertility rate.",
  "South Sudan": "South Sudan is the youngest country in the world.",
  "Spain": "Spain has the world's oldest restaurant, Sobrino de Botin.",
  "Sri Lanka": "Sri Lanka was the first country to have a female prime minister.",
  "Sudan": "In Arabic, the name of the country means ‘the land of the blacks’. The Republic of Sudan actually has 223 of its own pyramids, double the number of pyramids in Egypt.",
  "Suriname": "Suriname is the smallest country in South America but boasts incredible biodiversity, including jaguars, giant river otters, and diverse bird species. The capital city, Paramaribo, features well-preserved Dutch colonial architecture.",
  "Svalbard and Jan Mayen": "Svalbard has more polar bears than people.",
  "Sweden": "Sweden contains 267,570 islands, most for any single country in the world.",
  "Switzerland": "Switzerland is the only country in world with enough nuclear bunkers for it's entire population and they have a total back up water supply in the event of nuclear war or poisoning. Switzerland technically also doesn't have an official capital.",
  "Syria": "Syria has the oldest continuously inhabited city, Damascus.",
  "Taiwan": "Despite being a disputed territory itself, Taiwan actually doesn't recognise that many countries officially.",
  "Tajikistan": "Tajikistan has the world's second tallest dam.",
  "Tanzania": "Mount Kilimanjaro in Tanzania is the highest peak in Africa, standing at 5,895 meters.",
  "Thailand": "Thailand is the only country in Southeast Asia that has never been colonized by Europeans. Thailand is the world’s largest exporter of rice and is famous for its white-sand beaches and rich cultural heritage. Thailand is the world’s number one orchid exporter.",
  "Timor-Leste": "The name \"Timor\" is derived from the Malay word for \"East,\" making the country's name simply \"East East.\"",
  "Togo": "Togo is home to the largest voodoo market in the world.",
  "Tokelau": "Tokelau is powered entirely by solar energy.",
  "Tonga": "Tonga is the only monarchy in the Pacific.",
  "Trinidad and Tobago": "Trinidad and Tobago is the birthplace of calypso music.",
  "Tunisia": "Tunisia has the most well-preserved Roman amphitheater.",
  "Turkey": "Turkey leads the world in annual tea consumption per capita with 3.16 kg.",
  "Turkmenistan": "Turkmenistan has the Door to Hell, a burning gas crater.",
  "Turks and Caicos Islands": "The Turks and Caicos Islands have the third largest barrier reef.",
  "Tuvalu": "10% of Tuvalu's GDP is directly from their internet domain royalties (.tv).",
  "Uganda": "The endangered mountain gorilla finds refuge here, particularly in the Ruwenzori Mountains.",
  "Ukraine": "Ukraine has the deepest metro station in the world.",
  "United Arab Emirates": "The UAE has the tallest building in the world, Burj Khalifa.",
  "United Kingdom": "Industrial Revolution started in Britain. Also it stands out as the world’s only country without a written constitution.",
  "United States": "The Global Positioning System (GPS) is operated and maintained by the U.S. Air Force. The U.S. flag has evolved over time, now featuring 50 stars representing each state in the union. The current U.S. flag design was created by a high school student named Robert G. Heft. United States and Canada share the longest unprotected border in the world. Annually, the U.S. spends more on its military than the next seven highest-ranking countries in military spending combined. The Internet was first conceptualized in the United States.",
  "United States Minor Outlying Islands": "The United States Minor Outlying Islands are uninhabited.",
  "Uruguay": "Uruguayans take their mate (a traditional herbal drink) seriously. Sharing mate is a social ritual, often accompanied by conversation. Punta del Este, a popular beach resort, attracts visitors with its stunning coastline and vibrant nightlife.",
  "Uzbekistan": "Bread is sacred in Uzbekistan with a number of rules surrounding its use.",
  "Vanuatu": "Vanuatu is home to the world's only underwater post office.",
  "Vatican City": "The smallest country in Europe is Vatican City, which is also the smallest country in the world.",
  "Venezuela": "Venezuela is home to the Angel Falls, the world’s highest uninterrupted waterfall, plunging from Canaima National Park’s Auyantepui Mountain. The country has a rich musical heritage, including the lively rhythms of joropo and salsa.",
  "Vietnam": "Vietnam is the world’s largest exporter of cashew nuts and black pepper. It exports over a third of the world’s cashew nuts.",
  "Virgin Islands (U.S.)": "The U.S. Virgin Islands were purchased from Denmark in 1917.",
  "Wallis and Futuna": "Wallis and Futuna is an overseas territory of France.",
  "Western Sahara": "Western Sahara is the largest disputed territory in the world.",
  "Yemen": "Yemen is known for its architecture, including unique tower houses made of rammed earth and straw called \"skyscrapers of the desert.\" They are recognized as a UNESCO World Heritage Site.",
  "Zambia": "Zambia is renowned for the magnificent Victoria Falls, known locally as \"Mosi-oa-Tunya,\" meaning \"The Smoke That Thunders.\"",
  "Zimbabwe": "Zimbabwe experienced a period of hyperinflation in the late 2000s, with inflation rates reaching astronomical levels, leading to the country printing a 100 trillion Zimbabwean dollar banknote, which is the highest denomination ever issued.",
  // Add any additional facts from current or other sources if needed
};

const countryList = [
  { name: "Afghanistan", cca2: "AF", lat: 33, lng: 65, population: 43844000, region: "Asia" },
  { name: "Albania", cca2: "AL", lat: 41, lng: 20, population: 2363314, region: "Europe" },
  { name: "Algeria", cca2: "DZ", lat: 28, lng: 3, population: 47400000, region: "Africa" },
  { name: "Andorra", cca2: "AD", lat: 42.5, lng: 1.5, population: 88406, region: "Europe" },
  { name: "Angola", cca2: "AO", lat: -12.5, lng: 18.5, population: 36170961, region: "Africa" },
  { name: "Antigua and Barbuda", cca2: "AG", lat: 17.05, lng: -61.8, population: 103603, region: "Americas" },
  { name: "Argentina", cca2: "AR", lat: -34, lng: -64, population: 46735004, region: "Americas" },
  { name: "Armenia", cca2: "AM", lat: 40, lng: 45, population: 3076200, region: "Asia" },
  { name: "Australia", cca2: "AU", lat: -27, lng: 133, population: 27536874, region: "Oceania" },
  { name: "Austria", cca2: "AT", lat: 47.33333333, lng: 13.33333333, population: 9200931, region: "Europe" },
  { name: "Azerbaijan", cca2: "AZ", lat: 40.5, lng: 47.5, population: 10241722, region: "Asia" },
  { name: "Bahamas", cca2: "BS", lat: 25.0343, lng: -77.3963, population: 398165, region: "Americas" },
  { name: "Bahrain", cca2: "BH", lat: 26, lng: 50.55, population: 1594654, region: "Asia" },
  { name: "Bangladesh", cca2: "BD", lat: 24, lng: 90, population: 169828911, region: "Asia" },
  { name: "Barbados", cca2: "BB", lat: 13.16666666, lng: -59.53333333, population: 267800, region: "Americas" },
  { name: "Belarus", cca2: "BY", lat: 53, lng: 28, population: 9109280, region: "Europe" },
  { name: "Belgium", cca2: "BE", lat: 50.83333333, lng: 4, population: 11825551, region: "Europe" },
  { name: "Belize", cca2: "BZ", lat: 17.25, lng: -88.75, population: 417634, region: "Americas" },
  { name: "Benin", cca2: "BJ", lat: 9.5, lng: 2.25, population: 13224860, region: "Africa" },
  { name: "Bhutan", cca2: "BT", lat: 27.5, lng: 90.5, population: 784043, region: "Asia" },
  { name: "Bolivia", cca2: "BO", lat: -17, lng: -65, population: 11365333, region: "Americas" },
  { name: "Bosnia and Herzegovina", cca2: "BA", lat: 44, lng: 18, population: 3422000, region: "Europe" },
  { name: "Botswana", cca2: "BW", lat: -22, lng: 24, population: 2359609, region: "Africa" },
  { name: "Brazil", cca2: "BR", lat: -10, lng: -55, population: 213421037, region: "Americas" },
  { name: "Brunei", cca2: "BN", lat: 4.5, lng: 114.66666666, population: 455500, region: "Asia" },
  { name: "Bulgaria", cca2: "BG", lat: 43, lng: 25, population: 6437360, region: "Europe" },
  { name: "Burkina Faso", cca2: "BF", lat: 13, lng: -2, population: 24070553, region: "Africa" },
  { name: "Burundi", cca2: "BI", lat: -3.5, lng: 30, population: 12332788, region: "Africa" },
  { name: "Cambodia", cca2: "KH", lat: 13, lng: 105, population: 17577760, region: "Asia" },
  { name: "Cameroon", cca2: "CM", lat: 6, lng: 12, population: 29442327, region: "Africa" },
  { name: "Canada", cca2: "CA", lat: 60, lng: -95, population: 41651653, region: "Americas" },
  { name: "Cape Verde", cca2: "CV", lat: 16, lng: -24, population: 491233, region: "Africa" },
  { name: "Central African Republic", cca2: "CF", lat: 7, lng: 21, population: 6470307, region: "Africa" },
  { name: "Chad", cca2: "TD", lat: 15, lng: 19, population: 19340757, region: "Africa" },
  { name: "Chile", cca2: "CL", lat: -30, lng: -71, population: 20206953, region: "Americas" },
  { name: "China", cca2: "CN", lat: 35, lng: 105, population: 1408280000, region: "Asia" },
  { name: "Colombia", cca2: "CO", lat: 4, lng: -72, population: 53057212, region: "Americas" },
  { name: "Comoros", cca2: "KM", lat: -12.16666666, lng: 44.25, population: 919901, region: "Africa" },
  { name: "Congo", cca2: "CG", lat: -1, lng: 15, population: 6142180, region: "Africa" },
  { name: "Costa Rica", cca2: "CR", lat: 10, lng: -84, population: 5309625, region: "Americas" },
  { name: "Côte d'Ivoire", cca2: "CI", lat: 8, lng: -5, population: 30950155, region: "Africa" },
  { name: "Croatia", cca2: "HR", lat: 45.16666666, lng: 15.5, population: 3866233, region: "Europe" },
  { name: "Cuba", cca2: "CU", lat: 21.5, lng: -80, population: 9748007, region: "Americas" },
  { name: "Cyprus", cca2: "CY", lat: 35, lng: 33, population: 1309118, region: "Europe" },
  { name: "Czech Republic", cca2: "CZ", lat: 49.75, lng: 15.5, population: 10706803, region: "Europe" },
  { name: "DR Congo", cca2: "CD", lat: 0, lng: 25, population: 101000000, region: "Africa" },
  { name: "Denmark", cca2: "DK", lat: 56, lng: 10, population: 5968593, region: "Europe" },
  { name: "Djibouti", cca2: "DJ", lat: 11.5, lng: 43, population: 1035655, region: "Africa" },
  { name: "Dominica", cca2: "DM", lat: 15.41666666, lng: -61.33333333, population: 68949, region: "Americas" },
  { name: "Dominican Republic", cca2: "DO", lat: 19, lng: -70.66666666, population: 11132803, region: "Americas" },
  { name: "Ecuador", cca2: "EC", lat: -2, lng: -77.5, population: 18620000, region: "Americas" },
  { name: "Egypt", cca2: "EG", lat: 27, lng: 30, population: 112000000, region: "Africa" },
  { name: "El Salvador", cca2: "SV", lat: 13.83333333, lng: -88.91666666, population: 6596131, region: "Americas" },
  { name: "Equatorial Guinea", cca2: "GQ", lat: 2, lng: 10, population: 1543442, region: "Africa" },
  { name: "Eritrea", cca2: "ER", lat: 15, lng: 39, population: 3500000, region: "Africa" },
  { name: "Estonia", cca2: "EE", lat: 59, lng: 26, population: 1366542, region: "Europe" },
  { name: "Eswatini", cca2: "SZ", lat: -26.5, lng: 31.5, population: 1200000, region: "Africa" },
  { name: "Ethiopia", cca2: "ET", lat: 8, lng: 38, population: 131000000, region: "Africa" },
  { name: "Fiji", cca2: "FJ", lat: -18, lng: 175, population: 930702, region: "Oceania" },
  { name: "Finland", cca2: "FI", lat: 64, lng: 26, population: 5571974, region: "Europe" },
  { name: "France", cca2: "FR", lat: 46, lng: 2, population: 66351959, region: "Europe" },
  { name: "Gabon", cca2: "GA", lat: -1, lng: 11.75, population: 2388992, region: "Africa" },
  { name: "Gambia", cca2: "GM", lat: 13.4667, lng: -16.5667, population: 2586000, region: "Africa" },
  { name: "Georgia", cca2: "GE", lat: 42, lng: 43.5, population: 3714000, region: "Asia" },
  { name: "Germany", cca2: "DE", lat: 51, lng: 9, population: 83000000, region: "Europe" },
  { name: "Ghana", cca2: "GH", lat: 8, lng: -2, population: 33232986, region: "Africa" },
  { name: "Greece", cca2: "GR", lat: 39, lng: 22, population: 10329254, region: "Europe" },
  { name: "Grenada", cca2: "GD", lat: 12.1167, lng: -61.6667, population: 107825, region: "Americas" },
  { name: "Guatemala", cca2: "GT", lat: 15.5, lng: -90.25, population: 18608132, region: "Americas" },
  { name: "Guinea", cca2: "GN", lat: 11, lng: -10, population: 14353767, region: "Africa" },
  { name: "Guinea-Bissau", cca2: "GW", lat: 12, lng: -15, population: 2127223, region: "Africa" },
  { name: "Guyana", cca2: "GY", lat: 5, lng: -59, population: 813834, region: "Americas" },
  { name: "Haiti", cca2: "HT", lat: 19, lng: -72.4167, population: 11743017, region: "Americas" },
  { name: "Honduras", cca2: "HN", lat: 15, lng: -86.5, population: 10870000, region: "Americas" },
  { name: "Hungary", cca2: "HU", lat: 47, lng: 20, population: 9513000, region: "Europe" },
  { name: "Iceland", cca2: "IS", lat: 65, lng: -18, population: 383000, region: "Europe" },
  { name: "India", cca2: "IN", lat: 20, lng: 77, population: 1450000000, region: "Asia" },
  { name: "Indonesia", cca2: "ID", lat: -5, lng: 120, population: 279134508, region: "Asia" },
  { name: "Iran", cca2: "IR", lat: 32, lng: 53, population: 90000000, region: "Asia" },
  { name: "Iraq", cca2: "IQ", lat: 33, lng: 44, population: 46000000, region: "Asia" },
  { name: "Ireland", cca2: "IE", lat: 53, lng: -8, population: 5200000, region: "Europe" },
  { name: "Israel", cca2: "IL", lat: 31.5, lng: 34.75, population: 9400000, region: "Asia" },
  { name: "Italy", cca2: "IT", lat: 42.8333, lng: 12.8333, population: 58800000, region: "Europe" },
  { name: "Jamaica", cca2: "JM", lat: 18.25, lng: -77.5, population: 2800000, region: "Americas" },
  { name: "Japan", cca2: "JP", lat: 36, lng: 138, population: 123000000, region: "Asia" },
  { name: "Jordan", cca2: "JO", lat: 31, lng: 36, population: 11300000, region: "Asia" },
  { name: "Kazakhstan", cca2: "KZ", lat: 48, lng: 68, population: 19600000, region: "Asia" },
  { name: "Kenya", cca2: "KE", lat: 1, lng: 38, population: 56000000, region: "Africa" },
  { name: "Kiribati", cca2: "KI", lat: 1.4167, lng: 173, population: 135000, region: "Oceania" },
  { name: "Kuwait", cca2: "KW", lat: 29.5, lng: 45.75, population: 4400000, region: "Asia" },
  { name: "Kyrgyzstan", cca2: "KG", lat: 41, lng: 75, population: 6800000, region: "Asia" },
  { name: "Laos", cca2: "LA", lat: 18, lng: 105, population: 7600000, region: "Asia" },
  { name: "Latvia", cca2: "LV", lat: 57, lng: 25, population: 1800000, region: "Europe" },
  { name: "Lebanon", cca2: "LB", lat: 33.8333, lng: 35.8333, population: 5300000, region: "Asia" },
  { name: "Lesotho", cca2: "LS", lat: -29.5, lng: 28.5, population: 2300000, region: "Africa" },
  { name: "Liberia", cca2: "LR", lat: 6.5, lng: -9.5, population: 5500000, region: "Africa" },
  { name: "Libya", cca2: "LY", lat: 25, lng: 17, population: 7100000, region: "Africa" },
  { name: "Liechtenstein", cca2: "LI", lat: 47.1667, lng: 9.5333, population: 40000, region: "Europe" },
  { name: "Lithuania", cca2: "LT", lat: 56, lng: 24, population: 2600000, region: "Europe" },
  { name: "Luxembourg", cca2: "LU", lat: 49.75, lng: 6.1667, population: 660000, region: "Europe" },
  { name: "Madagascar", cca2: "MG", lat: -20, lng: 47, population: 30000000, region: "Africa" },
  { name: "Malawi", cca2: "MW", lat: -13.5, lng: 34, population: 21000000, region: "Africa" },
  { name: "Malaysia", cca2: "MY", lat: 2.5, lng: 112.5, population: 33338170, region: "Asia" },
  { name: "Maldives", cca2: "MV", lat: 3.25, lng: 73, population: 520000, region: "Asia" },
  { name: "Mali", cca2: "ML", lat: 17, lng: -4, population: 22500000, region: "Africa" },
  { name: "Malta", cca2: "MT", lat: 35.8333, lng: 14.5833, population: 520000, region: "Europe" },
  { name: "Marshall Islands", cca2: "MH", lat: 9, lng: 168, population: 59194, region: "Oceania" },
  { name: "Mauritania", cca2: "MR", lat: 20, lng: -12, population: 4900000, region: "Africa" },
  { name: "Mauritius", cca2: "MU", lat: -20.2833, lng: 57.55, population: 1270000, region: "Africa" },
  { name: "Mexico", cca2: "MX", lat: 23, lng: -102, population: 126190788, region: "Americas" },
  { name: "Micronesia", cca2: "FM", lat: 6.92, lng: 158.25, population: 115021, region: "Oceania" },
  { name: "Moldova", cca2: "MD", lat: 47, lng: 29, population: 2500000, region: "Europe" },
  { name: "Monaco", cca2: "MC", lat: 43.7333, lng: 7.4, population: 39000, region: "Europe" },
  { name: "Mongolia", cca2: "MN", lat: 46, lng: 105, population: 3400000, region: "Asia" },
  { name: "Montenegro", cca2: "ME", lat: 42.5, lng: 19.3, population: 617000, region: "Europe" },
  { name: "Morocco", cca2: "MA", lat: 32, lng: -5, population: 38000000, region: "Africa" },
  { name: "Mozambique", cca2: "MZ", lat: -18.25, lng: 35, population: 34000000, region: "Africa" },
  { name: "Myanmar", cca2: "MM", lat: 22, lng: 98, population: 54409800, region: "Asia" },
  { name: "Namibia", cca2: "NA", lat: -22, lng: 17, population: 2600000, region: "Africa" },
  { name: "Nauru", cca2: "NR", lat: -0.5333, lng: 166.9167, population: 13000, region: "Oceania" },
  { name: "Nepal", cca2: "NP", lat: 28, lng: 84, population: 30000000, region: "Asia" },
  { name: "Netherlands", cca2: "NL", lat: 52.5, lng: 5.75, population: 17800000, region: "Europe" },
  { name: "New Zealand", cca2: "NZ", lat: -41, lng: 174, population: 5200000, region: "Oceania" },
  { name: "Nicaragua", cca2: "NI", lat: 13, lng: -85, population: 6800000, region: "Americas" },
  { name: "Niger", cca2: "NE", lat: 16, lng: 8, population: 27000000, region: "Africa" },
  { name: "Nigeria", cca2: "NG", lat: 10, lng: 8, population: 225000000, region: "Africa" },
  { name: "North Korea", cca2: "KP", lat: 40, lng: 127, population: 26000000, region: "Asia" },
  { name: "North Macedonia", cca2: "MK", lat: 41.8333, lng: 22, population: 2060000, region: "Europe" },
  { name: "Norway", cca2: "NO", lat: 62, lng: 10, population: 5500000, region: "Europe" },
  { name: "Oman", cca2: "OM", lat: 21, lng: 57, population: 4700000, region: "Asia" },
  { name: "Pakistan", cca2: "PK", lat: 30, lng: 70, population: 240000000, region: "Asia" },
  { name: "Palau", cca2: "PW", lat: 7.5, lng: 134.5, population: 18000, region: "Oceania" },
  { name: "Panama", cca2: "PA", lat: 9, lng: -80, population: 4500000, region: "Americas" },
  { name: "Papua New Guinea", cca2: "PG", lat: -6, lng: 147, population: 10000000, region: "Oceania" },
  { name: "Paraguay", cca2: "PY", lat: -23, lng: -58, population: 6700000, region: "Americas" },
  { name: "Peru", cca2: "PE", lat: -10, lng: -76, population: 34000000, region: "Americas" },
  { name: "Philippines", cca2: "PH", lat: 13, lng: 122, population: 117000000, region: "Asia" },
  { name: "Poland", cca2: "PL", lat: 52, lng: 20, population: 37000000, region: "Europe" },
  { name: "Portugal", cca2: "PT", lat: 39.5, lng: -8, population: 10200000, region: "Europe" },
  { name: "Qatar", cca2: "QA", lat: 25.5, lng: 51.25, population: 2800000, region: "Asia" },
  { name: "Romania", cca2: "RO", lat: 46, lng: 25, population: 18500000, region: "Europe" },
  { name: "Russia", cca2: "RU", lat: 60, lng: 100, population: 144000000, region: "Europe" },
  { name: "Rwanda", cca2: "RW", lat: -2, lng: 30, population: 14000000, region: "Africa" },
  { name: "Saint Kitts and Nevis", cca2: "KN", lat: 17.3333, lng: -62.75, population: 48000, region: "Americas" },
  { name: "Saint Lucia", cca2: "LC", lat: 13.8833, lng: -60.9667, population: 180000, region: "Americas" },
  { name: "Saint Vincent and the Grenadines", cca2: "VC", lat: 13.25, lng: -61.2, population: 103000, region: "Americas" },
  { name: "Samoa", cca2: "WS", lat: -13.5833, lng: -172.3333, population: 205000, region: "Oceania" },
  { name: "San Marino", cca2: "SM", lat: 43.7667, lng: 12.4167, population: 34000, region: "Europe" },
  { name: "Sao Tome and Principe", cca2: "ST", lat: 0.1864, lng: 6.6131, population: 223107, region: "Africa" },
  { name: "Saudi Arabia", cca2: "SA", lat: 25, lng: 45, population: 36000000, region: "Asia" },
  { name: "Senegal", cca2: "SN", lat: 14, lng: -14, population: 18000000, region: "Africa" },
  { name: "Serbia", cca2: "RS", lat: 44, lng: 21, population: 6600000, region: "Europe" },
  { name: "Seychelles", cca2: "SC", lat: -4.5833, lng: 55.6667, population: 100000, region: "Africa" },
  { name: "Sierra Leone", cca2: "SL", lat: 8.5, lng: -11.5, population: 8600000, region: "Africa" },
  { name: "Singapore", cca2: "SG", lat: 1.3667, lng: 103.8, population: 6000000, region: "Asia" },
  { name: "Slovakia", cca2: "SK", lat: 48.6667, lng: 19.5, population: 5450000, region: "Europe" },
  { name: "Slovenia", cca2: "SI", lat: 46.1167, lng: 14.8167, population: 2100000, region: "Europe" },
  { name: "Solomon Islands", cca2: "SB", lat: -8, lng: 159, population: 740000, region: "Oceania" },
  { name: "Somalia", cca2: "SO", lat: 10, lng: 49, population: 18000000, region: "Africa" },
  { name: "South Africa", cca2: "ZA", lat: -29, lng: 24, population: 62000000, region: "Africa" },
  { name: "South Korea", cca2: "KR", lat: 37, lng: 127.5, population: 51000000, region: "Asia" },
  { name: "South Sudan", cca2: "SS", lat: 7, lng: 30, population: 11000000, region: "Africa" },
  { name: "Spain", cca2: "ES", lat: 40, lng: -4, population: 47000000, region: "Europe" },
  { name: "Sri Lanka", cca2: "LK", lat: 7, lng: 81, population: 22000000, region: "Asia" },
  { name: "Sudan", cca2: "SD", lat: 15, lng: 30, population: 48000000, region: "Africa" },
  { name: "Suriname", cca2: "SR", lat: 4, lng: -56, population: 620000, region: "Americas" },
  { name: "Sweden", cca2: "SE", lat: 62, lng: 15, population: 10500000, region: "Europe" },
  { name: "Switzerland", cca2: "CH", lat: 47, lng: 8, population: 8800000, region: "Europe" },
  { name: "Syria", cca2: "SY", lat: 35, lng: 38, population: 23000000, region: "Asia" },
  { name: "Taiwan", cca2: "TW", lat: 23.5, lng: 121, population: 23816775, region: "Asia" },
  { name: "Tajikistan", cca2: "TJ", lat: 39, lng: 71, population: 10000000, region: "Asia" },
  { name: "Tanzania", cca2: "TZ", lat: -6, lng: 35, population: 67000000, region: "Africa" },
  { name: "Thailand", cca2: "TH", lat: 15, lng: 100, population: 70000000, region: "Asia" },
  { name: "Timor-Leste", cca2: "TL", lat: -8.8333, lng: 125.9167, population: 1400000, region: "Asia" },
  { name: "Togo", cca2: "TG", lat: 8, lng: 1.1667, population: 9000000, region: "Africa" },
  { name: "Tonga", cca2: "TO", lat: -20, lng: -175, population: 105695, region: "Oceania" },
  { name: "Trinidad and Tobago", cca2: "TT", lat: 11, lng: -61, population: 1400000, region: "Americas" },
  { name: "Tunisia", cca2: "TN", lat: 34, lng: 9, population: 12000000, region: "Africa" },
  { name: "Turkey", cca2: "TR", lat: 39, lng: 35, population: 85000000, region: "Asia" },
  { name: "Turkmenistan", cca2: "TM", lat: 40, lng: 60, population: 6500000, region: "Asia" },
  { name: "Tuvalu", cca2: "TV", lat: -8, lng: 178, population: 12000, region: "Oceania" },
  { name: "Uganda", cca2: "UG", lat: 1, lng: 32, population: 50000000, region: "Africa" },
  { name: "Ukraine", cca2: "UA", lat: 49, lng: 32, population: 36000000, region: "Europe" },
  { name: "United Arab Emirates", cca2: "AE", lat: 24, lng: 54, population: 10000000, region: "Asia" },
  { name: "United Kingdom", cca2: "GB", lat: 54, lng: -2, population: 68000000, region: "Europe" },
  { name: "United States", cca2: "US", lat: 38, lng: -97, population: 341000000, region: "Americas" },
  { name: "Uruguay", cca2: "UY", lat: -33, lng: -56, population: 3500000, region: "Americas" },
  { name: "Uzbekistan", cca2: "UZ", lat: 41, lng: 64, population: 35000000, region: "Asia" },
  { name: "Vanuatu", cca2: "VU", lat: -16, lng: 167, population: 330000, region: "Oceania" },
  { name: "Vatican City", cca2: "VA", lat: 41.9, lng: 12.45, population: 825, region: "Europe" },
  { name: "Venezuela", cca2: "VE", lat: 8, lng: -66, population: 28000000, region: "Americas" },
  { name: "Vietnam", cca2: "VN", lat: 16.1667, lng: 107.8333, population: 99000000, region: "Asia" },
  { name: "Yemen", cca2: "YE", lat: 15, lng: 48, population: 34000000, region: "Asia" },
  { name: "Zambia", cca2: "ZM", lat: -15, lng: 30, population: 20000000, region: "Africa" },
  { name: "Zimbabwe", cca2: "ZW", lat: -20, lng: 30, population: 16300000, region: "Africa" },
];

const countryDataHardcoded = countryList.map((country, index) => ({
  ...country,
  flag: `https://flagcdn.com/${country.cca2.toLowerCase()}.svg`,
  sdgs: [`Goal #${(index % 17 + 1)}`, `Goal #${((index + 1) % 17 + 1)}`],
  fact: facts[country.name] || `Did you know? ${country.name} is in ${country.region} with ${country.population.toLocaleString()} people.`,
}));

const redIcon = L.divIcon({
  className: "atlas-marker-shell",
  html: '<span class="atlas-marker"><span></span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const selectedIcon = L.divIcon({
  className: "atlas-marker-shell atlas-marker-selected-shell",
  html: '<span class="atlas-marker atlas-marker-selected"><span></span></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const regions = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"];

const Atlas = ({ level = 1 }) => {
  const currentLevel = Math.max(1, Number(level) || 1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState("All");

  const visibleCountries = countryDataHardcoded.filter((country) => {
    const matchesSearch = country.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesRegion = activeRegion === "All" || country.region === activeRegion;
    return matchesSearch && matchesRegion;
  });

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setSearch("");
  };

  return (
    <div className="atlas-page min-h-screen">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        <header className="atlas-header mb-6 flex flex-col gap-5 rounded-[28px] p-6 text-white sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
              Explore the world
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Atlas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              Discover countries, compare populations, and uncover the stories that make every place unique.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <div className="text-2xl font-bold">{countryDataHardcoded.length}</div>
              <div className="text-xs text-white/70">places to explore</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <div className="text-2xl font-bold">{activeRegion === "All" ? "6" : "1"}</div>
              <div className="text-xs text-white/70">regions</div>
            </div>
          </div>
        </header>

        <main className="grid min-h-[680px] grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <section className="atlas-map-card relative isolate z-0 flex min-h-[520px] flex-col overflow-hidden rounded-[26px] border border-white/60 bg-white shadow-2xl shadow-slate-950/15">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">World map</h2>
                  <p className="mt-1 text-xs text-slate-500">Choose a marker or search for a place</p>
                </div>
                <label className="relative block w-full xl:max-w-xs">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
                  </span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search countries…"
                    aria-label="Search countries"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </label>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filter countries by region">
                {regions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setActiveRegion(region)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      activeRegion === region
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                        : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-h-[440px] flex-1">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                minZoom={2}
                maxZoom={8}
                scrollWheelZoom={true}
                zoomControl={true}
                worldCopyJump={true}
                style={{ height: "100%", minHeight: "440px", width: "100%", background: "#eef2f7" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {visibleCountries.map((country) => (
                  <Marker
                    key={country.cca2}
                    position={[country.lat, country.lng]}
                    icon={selectedCountry?.cca2 === country.cca2 ? selectedIcon : redIcon}
                    eventHandlers={{ click: () => setSelectedCountry(country) }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      <span className="font-semibold">{country.name}</span>
                    </Tooltip>
                  </Marker>
                ))}
              </MapContainer>
              <div className="pointer-events-none absolute bottom-4 left-4 z-[400] rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-medium text-slate-600 shadow-lg backdrop-blur">
                Showing <span className="font-bold text-slate-900">{visibleCountries.length}</span> places
              </div>
            </div>
          </section>

          <aside className="atlas-details min-h-[420px] overflow-y-auto rounded-[26px] border border-white/60 bg-white p-5 shadow-2xl shadow-slate-950/15 sm:p-6">
            {selectedCountry ? (
              <div className="animate-[atlasIn_250ms_ease-out]">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5">
                  <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-violet-200/30 blur-2xl" />
                  <div className="relative flex items-center gap-4">
                    <img
                      src={selectedCountry.flag}
                      alt={`${selectedCountry.name} flag`}
                      className="h-16 w-24 rounded-xl border border-white object-cover shadow-md"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Country profile</div>
                      <h2 className="mt-1 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{selectedCountry.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">{selectedCountry.region}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-xs font-medium text-slate-500">Population</div>
                    <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">{selectedCountry.population.toLocaleString()}</div>
                    <div className="mt-1 text-[11px] text-slate-400">people</div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-xs font-medium text-slate-500">Region</div>
                    <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">{selectedCountry.region}</div>
                    <div className="mt-1 text-[11px] text-slate-400">world region</div>
                  </div>
                </div>

                <section className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Related SDGs</h3>
                    <span className="text-xs text-slate-400">UN goals</span>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {selectedCountry.sdgs.map((goal, index) => (
                      <li key={`${goal}-${index}`} className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">{goal}</li>
                    ))}
                  </ul>
                </section>

                <section className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100" aria-hidden="true">✦</span>
                    A little-known fact
                  </div>
                  <p className="mt-3 text-sm leading-6 text-amber-950/80">{selectedCountry.fact}</p>
                </section>

                {currentLevel >= 8 ? (
                  <section className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                    <div className="text-sm font-bold text-violet-900">Atlas Bonus Insight</div>
                    <p className="mt-2 text-sm leading-6 text-violet-950/80">
                      {selectedCountry.name} has the <strong>#{countryDataHardcoded.filter((country) => Number(country.population) > Number(selectedCountry.population)).length + 1}</strong> largest population among the {countryDataHardcoded.length} places in this Atlas.
                    </p>
                  </section>
                ) : (
                  <p className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-3 text-xs font-semibold text-violet-800">Unlock Atlas population insights at Level 8.</p>
                )}
              </div>
            ) : (
              <div className="flex min-h-[380px] flex-col items-center justify-center px-5 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600">
                  <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z"/></svg>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Your next discovery</h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Select a marker on the map to explore a country’s population, region, SDGs, and a fascinating fact.</p>
                <div className="mt-5 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">{visibleCountries.length} places currently on the map</div>
              </div>
            )}
          </aside>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .atlas-page {
          background: radial-gradient(ellipse at 15% 0%, rgba(124, 58, 237, .20), transparent 35%),
                      radial-gradient(ellipse at 95% 30%, rgba(79, 70, 229, .16), transparent 32%),
                      #f4f5fb;
        }
        .atlas-header {
          background: linear-gradient(120deg, #21164b 0%, #392273 48%, #5b3ca5 100%);
          box-shadow: 0 18px 48px rgba(39, 24, 86, .22);
        }
        .atlas-marker-shell { background: transparent; border: 0; }
        .atlas-marker {
          display: flex; width: 24px; height: 24px; align-items: center; justify-content: center;
          border: 2px solid white; border-radius: 9999px; background: #7653d6;
          box-shadow: 0 3px 10px rgba(48, 31, 104, .35); transition: transform .15s ease, background .15s ease;
        }
        .atlas-marker span { width: 6px; height: 6px; border-radius: 9999px; background: white; }
        .atlas-marker:hover { transform: scale(1.25); background: #4f35a3; }
        .atlas-marker-selected { width: 30px; height: 30px; background: #f97316; box-shadow: 0 0 0 6px rgba(249, 115, 22, .2), 0 4px 14px rgba(124, 45, 18, .35); }
        .atlas-marker-selected-shell { z-index: 500 !important; }
        .atlas-details::-webkit-scrollbar { width: 7px; }
        .atlas-details::-webkit-scrollbar-thumb { background: #d8d3e8; border-radius: 99px; }
        @keyframes atlasIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
};

export default Atlas;

