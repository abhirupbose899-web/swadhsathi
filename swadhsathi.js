// === Project Setup Instructions ===
// 1. Create a project directory: `mkdir swadhsathi && cd swadhsathi`
// 2. Initialize frontend: `npx create-react-app client && cd client && npm install firebase axios react-router-dom tailwindcss react-responsive-carousel i18next react-i18next i18next-browser-languagedetector i18next-http-backend`
// 3. Initialize backend: `cd .. && mkdir server && cd server && npm init -y && npm install express firebase-admin axios dotenv cors`
// 4. Set up Firebase: Create a Firebase project, download serviceAccountKey.json, and place it in /server
// 5. Set up environment variables in /server/.env: GOOGLE_CLOUD_API_KEY, OPENAI_API_KEY
// 6. Deploy frontend to Firebase Hosting and backend to Google Cloud Run

// === File: client/src/index.css ===
/*
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Noto+Sans+Devanagari&family=Noto+Sans+Tamil&family=Noto+Sans+Bengali&family=Noto+Sans+Marathi&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
*/

// === File: client/tailwind.config.js ===
/*
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        spicePurple: '#6B4E71',
        chiliRed: '#D32F2F',
        cream: '#FFF8E7',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'sans-serif'],
        marathi: ['Noto Sans Marathi', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
*/

// === File: client/src/i18n.js ===
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'ta', 'bn', 'mr'],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// === File: client/public/locales/en/translation.json ===
/*
{
  "welcome": "Welcome to SwadhSathi",
  "searchPlaceholder": "Search recipes...",
  "cookWithWhatYouHave": "Cook with What You Have",
  "exploreCuisines": "Explore Cuisines",
  "northIndian": "North Indian",
  "southIndian": "South Indian",
  "bengali": "Bengali",
  "fusion": "Fusion",
  "trendingDishes": "Trending Dishes",
  "ingredientScanner": "AI Ingredient Scanner",
  "detectedIngredients": "Detected Ingredients",
  "suggestedRecipes": "Suggested Recipes"
}
*/
// Repeat for hi, ta, bn, mr with respective translations

// === File: client/src/index.jsx ===
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <I18nextProvider i18n={i18n}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </I18nextProvider>
);

// === File: client/src/App.jsx ===
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RecipeExplorer from './components/RecipeExplorer';
import IngredientScanner from './components/IngredientScanner';
import LanguageSwitcher from './components/LanguageSwitcher';

const App = () => {
  return (
    <div className="min-h-screen bg-cream dark:bg-gray-800" dir="auto">
      <LanguageSwitcher />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipe-explorer" element={<RecipeExplorer />} />
        <Route path="/ingredient-scanner" element={<IngredientScanner />} />
        {/* Add routes for RecipeDetail, MyKitchen, Favorites, CookingAssistant, UserProfile */}
      </Routes>
    </div>
  );
};

export default App;

// === File: client/src/components/LanguageSwitcher.jsx ===
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2 p-4 bg-spicePurple text-cream rounded-lg">
      {['en', 'hi', 'ta', 'bn', 'mr'].map((lng) => (
        <button
          key={lng}
          className={`px-3 py-1 rounded ${i18n.language === lng ? 'bg-chiliRed' : 'bg-cream text-spicePurple'}`}
          onClick={() => changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

// === File: client/src/components/HomePage.jsx ===
import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const fontClass = i18n.language === 'hi' ? 'font-devanagari' :
                   i18n.language === 'ta' ? 'font-tamil' :
                   i18n.language === 'bn' ? 'font-bengali' :
                   i18n.language === 'mr' ? 'font-marathi' : 'font-poppins';

  useEffect(() => {
    axios.get('/api/recipes/featured', { params: { lng: i18n.language } }).then(res => setFeaturedRecipes(res.data));
    axios.get('/api/recipes/trending', { params: { lng: i18n.language } }).then(res => setTrendingRecipes(res.data));
  }, [i18n.language]);

  return (
    <div className={`bg-cream min-h-screen p-4 ${fontClass}`}>
      <h1 className="text-3xl mb-4">{t('welcome')}</h1>
      <Carousel showThumbs={false} autoPlay>
        {featuredRecipes.map(recipe => (
          <div key={recipe.recipe_id}>
            <img src={recipe.image_url} alt={recipe.recipe_name} className="rounded-lg" />
            <p className="legend">{recipe.recipe_name}</p>
          </div>
        ))}
      </Carousel>
      <button
        className="bg-chiliRed text-white px-6 py-2 rounded-full my-4"
        onClick={() => window.location.href = '/ingredient-scanner'}
      >
        📸 {t('cookWithWhatYouHave')}
      </button>
      <h2 className="text-2xl my-4">{t('exploreCuisines')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['northIndian', 'southIndian', 'bengali', 'fusion'].map(cuisine => (
          <div key={cuisine} className="bg-spicePurple text-cream p-4 rounded-lg text-center">
            {t(cuisine)}
          </div>
        ))}
      </div>
      <h2 className="text-2xl my-4">{t('trendingDishes')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trendingRecipes.map(recipe => (
          <div key={recipe.recipe_id} className="bg-white p-4 rounded-lg shadow">
            <img src={recipe.image_url} alt={recipe.recipe_name} className="w-full h-40 object-cover rounded" />
            <h3>{recipe.recipe_name}</h3>
            <p>{recipe.region} | {recipe.cooking_time} mins</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;

// === File: client/src/components/RecipeExplorer.jsx ===
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const RecipeExplorer = () => {
  const { t, i18n } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [filters, setFilters] = useState({
    cuisine: '',
    diet: '',
    time: '',
    difficulty: '',
    calories: '',
  });
  const [search, setSearch] = useState('');
  const fontClass = i18n.language === 'hi' ? 'font-devanagari' :
                   i18n.language === 'ta' ? 'font-tamil' :
                   i18n.language === 'bn' ? 'font-bengali' :
                   i18n.language === 'mr' ? 'font-marathi' : 'font-poppins';

  useEffect(() => {
    const fetchRecipes = async () => {
      const res = await axios.get('/api/recipes', { params: { ...filters, search, lng: i18n.language } });
      setRecipes(res.data);
    };
    fetchRecipes();
  }, [filters, search, i18n.language]);

  return (
    <div className={`bg-cream min-h-screen p-4 ${fontClass}`}>
      <input
        type="text"
        placeholder={t('searchPlaceholder')}
        className="w-full p-2 rounded-lg mb-4"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="flex gap-4 mb-4">
        <select onChange={e => setFilters({ ...filters, cuisine: e.target.value })}>
          <option value="">{t('allCuisines')}</option>
          <option value="North Indian">{t('northIndian')}</option>
          <option value="South Indian">{t('southIndian')}</option>
          {/* Add more */}
        </select>
        {/* Add other filters (diet, time, etc.) */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recipes.map(recipe => (
          <div key={recipe.recipe_id} className="bg-white p-4 rounded-lg shadow">
            <img src={recipe.image_url} alt={recipe.recipe_name} className="w-full h-40 object-cover rounded" />
            <h3>{recipe.recipe_name}</h3>
            <p>{recipe.rating} ⭐ | {recipe.cooking_time} mins</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeExplorer;

// === File: client/src/components/IngredientScanner.jsx ===
import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const IngredientScanner = () => {
  const { t, i18n } = useTranslation();
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const fontClass = i18n.language === 'hi' ? 'font-devanagari' :
                   i18n.language === 'ta' ? 'font-tamil' :
                   i18n.language === 'bn' ? 'font-bengali' :
                   i18n.language === 'mr' ? 'font-marathi' : 'font-poppins';

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.post('/api/ai/ingredient-scan', formData);
    setIngredients(res.data.ingredients);
    const recipeRes = await axios.post('/api/recipes/suggestions', { ingredients: res.data.ingredients, lng: i18n.language });
    setSuggestedRecipes(recipeRes.data);
  };

  return (
    <div className={`bg-cream min-h-screen p-4 ${fontClass}`}>
      <h2 className="text-2xl">{t('ingredientScanner')}</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} className="my-4" />
      {image && <img src={image} alt="Uploaded" className="w-64 h-64 object-cover rounded-lg" />}
      <h3>{t('detectedIngredients')}:</h3>
      <ul>
        {ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
      <h3>{t('suggestedRecipes')}:</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestedRecipes.map(recipe => (
          <div key={recipe.recipe_id} className="bg-white p-4 rounded-lg shadow">
            <img src={recipe.image_url} alt={recipe.recipe_name} className="w-full h-40 object-cover rounded" />
            <h3>{recipe.recipe_name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IngredientScanner;

// === File: server/firebaseConfig.js ===
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com',
});

const db = admin.firestore();
module.exports = { db, admin };

// === File: server/server.js ===
const express = require('express');
const cors = require('cors');
const recipeRoutes = require('./routes/recipes');
const aiRoutes = require('./routes/ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/recipes', recipeRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// === File: server/routes/recipes.js ===
const express = require('express');
const { db } = require('../firebaseConfig');
const router = express.Router();

router.get('/featured', async (req, res) => {
  const { lng = 'en' } = req.query;
  const snapshot = await db.collection('recipes').where('featured', '==', true).limit(5).get();
  const recipes = snapshot.docs.map(doc => ({
    recipe_id: doc.id,
    recipe_name: doc.data().recipe_name[lng],
    ingredients: doc.data().ingredients[lng],
    instructions: doc.data().instructions[lng],
    ...doc.data(),
  }));
  res.json(recipes);
});

router.get('/', async (req, res) => {
  const { cuisine, diet, time, difficulty, calories, search, lng = 'en' } = req.query;
  let query = db.collection('recipes');
  if (cuisine) query = query.where('region', '==', cuisine);
  if (diet) query = query.where('diet_type', '==', diet);
  if (search) query = query.where(`recipe_name.${lng}`, '>=', search).where(`recipe_name.${lng}`, '<=', search + '\uf8ff');
  const snapshot = await query.get();
  const recipes = snapshot.docs.map(doc => ({
    recipe_id: doc.id,
    recipe_name: doc.data().recipe_name[lng],
    ingredients: doc.data().ingredients[lng],
    instructions: doc.data().instructions[lng],
    ...doc.data(),
  }));
  res.json(recipes);
});

router.post('/suggestions', async (req, res) => {
  const { ingredients, lng = 'en' } = req.body;
  const snapshot = await db.collection('recipes')
    .where('ingredients', 'array-contains-any', ingredients)
    .limit(5)
    .get();
  const recipes = snapshot.docs.map(doc => ({
    recipe_id: doc.id,
    recipe_name: doc.data().recipe_name[lng],
    ingredients: doc.data().ingredients[lng],
    instructions: doc.data().instructions[lng],
    ...doc.data(),
  }));
  res.json(recipes);
});

module.exports = router;

// === File: server/routes/ai.js ===
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/ingredient-scan', async (req, res) => {
  const image = req.body.image; // Assume base64
  try {
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      {
        requests: [
          {
            image: { content: image },
            features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
          },
        ],
      }
    );
    const ingredients = response.data.responses[0].labelAnnotations
      .map(label => label.description)
      .filter(label => /* filter food-related labels */);
    res.json({ ingredients });
  } catch (error) {
    res.status(500).json({ error: 'Image recognition failed' });
  }
});

router.post('/query', async (req, res) => {
  const { query, lng = 'en' } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: `Respond in ${lng === 'en' ? 'English' : lng === 'hi' ? 'Hindi' : lng === 'ta' ? 'Tamil' : lng === 'bn' ? 'Bengali' : 'Marathi'}. Find recipes or substitutions based on: ${query}`,
        max_tokens: 200,
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );
    res.json({ response: response.data.choices[0].text });
  } catch (error) {
    res.status(500).json({ error: 'AI query failed' });
  }
});

module.exports = router;

// === File: server/recipes.json (Sample Data) ===
/*
[
  {
    "recipe_id": "1",
    "recipe_name": {
      "en": "Butter Chicken",
      "hi": "बटर चिकन",
      "ta": "வெண்ணெய் கோழி",
      "bn": "বাটার চিকেন",
      "mr": "बटर चिकन"
    },
    "ingredients": {
      "en": ["chicken", "butter", "tomato", "cream"],
      "hi": ["चिकन", "मक्खन", "टमाटर", "क्रीम"],
      "ta": ["கோழி", "வெண்ணெய்", "தக்காளி", "கிரீம்"],
      "bn": ["মুরগি", "মাখন", "টমেটো", "ক্রিম"],
      "mr": ["चिकन", "लोणी", "टोमॅटो", "क्रीम"]
    },
    "instructions": {
      "en": ["Marinate chicken...", "Cook in butter..."],
      "hi": ["चिकन को मैरिनेट करें...", "मक्खन में पकाएं..."],
      "ta": ["கோழியை மரினேட் செய்யவும்...", "வெண்ணெயில் சமைக்கவும்..."],
      "bn": ["মুরগি ম্যারিনেট করুন...", "মাখনে রান্না করুন..."],
      "mr": ["चिकन मॅरिनेट करा...", "लोण्यात शिजवा..."]
    },
    "region": "North Indian",
    "diet_type": "Non-Veg",
    "cooking_time": 45,
    "difficulty": "Medium",
    "nutrition_facts": { "calories": 600, "protein": 30, "fat": 25, "carbs": 15 },
    "tags": ["spicy", "creamy"],
    "rating": 4.5,
    "author": "user123",
    "featured": true
  }
]
*/

// === File: server/uploadRecipes.js ===
const { db } = require('./firebaseConfig');
const recipes = require('./recipes.json');

async function uploadRecipes() {
  for (const recipe of recipes) {
    await db.collection('recipes').add(recipe);
  }
  console.log('Recipes uploaded');
}
uploadRecipes();

// === Deployment Instructions ===
/*
Frontend (Firebase Hosting):
1. cd client
2. npm run build
3. firebase init hosting
4. firebase deploy

Backend (Google Cloud Run):
1. cd server
2. Create Dockerfile:
   FROM node:16
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
3. gcloud run deploy swadhsathi-backend \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
*/
