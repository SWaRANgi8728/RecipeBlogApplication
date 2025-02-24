/*const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/recipe-share', { useNewUrlParser: true, useUnifiedTopology: true });

const recipeSchema = new mongoose.Schema({
    title: String,
    cuisine: String,
    difficulty: String,
    ingredients: String,
    steps: String,
    image: String,
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Middleware
app.use(express.static('public'));
app.use(express.json());

// File upload setup (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
app.post('/uploadRecipe', upload.single('image'), async (req, res) => {
    const { title, cuisine, difficulty, ingredients, steps } = req.body;
    const image = req.file.filename;

    const newRecipe = new Recipe({ title, cuisine, difficulty, ingredients, steps, image });
    await newRecipe.save();
    res.status(200).send('Recipe uploaded');
});

app.get('/searchRecipes', async (req, res) => {
    const query = req.query.q;
    const recipes = await Recipe.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { cuisine: { $regex: query, $options: 'i' } }
        ]
    });
    res.json(recipes);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});*/

// Required dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();

// Use CORS middleware to allow requests from different origins (i.e., your frontend)
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (images) from the "uploads" directory
app.use(express.static('uploads'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/recipeShare', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('MongoDB connection error:', err));

// Recipe Schema to define the structure of the recipe data
const recipeSchema = new mongoose.Schema({
    title: String,
    cuisine: String,
    difficulty: String,
    ingredients: String,
    steps: String,
    image: String, // Store the filename of the image
});

// Recipe Model based on the schema
const Recipe = mongoose.model('Recipe', recipeSchema);

// Set up Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save images in the "uploads" folder
    },
    filename: (req, file, cb) => {
        // Use the current timestamp and file extension to prevent overwriting files
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

// API endpoint to handle recipe uploads
app.post('/upload-recipe', upload.single('image'), async (req, res) => {
    console.log('Received request body:', req.body);
    console.log('File uploaded:', req.file);

    // Destructure the recipe data from the request body
    const { title, cuisine, difficulty, ingredients, steps } = req.body;
    const image = req.file ? req.file.filename : null; // Check if an image was uploaded

    // Validate the required fields
    if (!title || !cuisine || !difficulty || !ingredients || !steps || !image) {
        return res.status(400).json({ success: false, error: 'All fields are required, including an image.' });
    }

    try {
        // Create a new Recipe object with the form data
        const newRecipe = new Recipe({
            title,
            cuisine,
            difficulty,
            ingredients,
            steps,
            image
        });

        // Save the new recipe in the database
        await newRecipe.save();
        console.log('Recipe saved to database:', newRecipe);

        // Send a success response
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).json({ success: false, error: 'Failed to upload recipe' });
    }
});

// Start the server and listen on port 5000
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
