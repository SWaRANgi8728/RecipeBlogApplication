//dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Use CORS middleware to allow requests from different origins (i.e., your frontend)
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static assets (CSS, JS, images, etc.) directly from the root directory
app.use(express.static(path.join(__dirname)));

// Serve static files (images) from the "uploads" directory
app.use(express.static('uploads'));

// Serve the index.html file when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Directly serve from the root directory
});
app.get('/recipe.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'recipe.html'));
});


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/recipeShare', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('MongoDB connection error:', err));

// Recipe Schema to define the structure of the recipe data
const recipeSchema = new mongoose.Schema({
    name: String, 
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
    const { name, title, cuisine, difficulty, ingredients, steps } = req.body;
    const image = req.file ? req.file.filename : null; // Check if an image was uploaded

    // Validate the required fields
    if ( !name || !title || !cuisine || !difficulty || !ingredients || !steps || !image) {
        return res.status(400).json({ success: false, error: 'All fields are required, including an image.' });
    }

    try {
        // Create a new Recipe object with the form data
        const newRecipe = new Recipe({
            name,
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

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  });
  
  const User = mongoose.model('User', userSchema);

  // User registration route
app.post('/register', async (req, res) => {
    const {name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'all fields are required.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already in use.' });
        }

        // Create a new User object
        const newUser = new User({ name, email, password });

        // Save the user to the database
        await newUser.save();

        // Send a success response
        res.json({ success: true });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, error: 'Failed to register user.' });
    }
});

// User login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid email or password.' });
        }

        // Check if the password matches
        if (user.password !== password) {
            return res.status(400).json({ success: false, error: 'Invalid email or password.' });
        }

        

        res.json({ success: true, userId: user._id, name: user.name });

        // Send a success response
        //res.json({ success: true });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ success: false, error: 'Failed to log in user.' });
    }
});

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);


app.post('/api/notification', async (req, res) => {
    const { userId, message } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ success: false, error: 'Missing userId or message' });
    }

    try {
        const notification = new Notification({
            userId,
            message,
            read: false
        });

        await notification.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving notification:', error);
        res.status(500).json({ success: false });
    }
});
app.get('/api/notifications', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) return res.status(400).json({ success: false });

    const notifications = await Notification.find({ userId, read: false }).sort({ createdAt: -1 });
    res.json(notifications);
});

// Simulate a database using a JSON file
const DB_FILE = './data.json';
function loadData() {
    if (!fs.existsSync(DB_FILE)) return {};
    return JSON.parse(fs.readFileSync(DB_FILE));
}
function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Endpoint to get recipe data
app.get('/api/recipe-data', (req, res) => {
    const { id } = req.query;
    const data = loadData();
    const recipeData = data[id] || { likes: 0, comments: [] };
    res.json(recipeData);
});

app.post('/api/like', async (req, res) => {
    const { recipeId, userId, userName, recipeTitle } = req.body;
    const data = loadData();

    if (!data[recipeId]) data[recipeId] = { likes: 0, comments: [] };
    data[recipeId].likes += 1;

    saveData(data);

    // Save a notification to DB
    try {
        await Notification.create({
            userId,
            message: `${userName} liked the recipe "${recipeTitle}"`
        });
    } catch (err) {
        console.error("Failed to save like notification:", err);
    }

    res.json({ success: true, likes: data[recipeId].likes });
});

app.post('/api/comment', async (req, res) => {
    const { recipeId, commentText, userId, userName, recipeTitle } = req.body;
    const data = loadData();

    if (!data[recipeId]) data[recipeId] = { likes: 0, comments: [] };
    data[recipeId].comments.push(commentText);

    saveData(data);

    // Save a notification to DB
    try {
        await Notification.create({
            userId,
            message: `${userName} commented on "${recipeTitle}"`
        });
    } catch (err) {
        console.error("Failed to save comment notification:", err);
    }

    res.json({ success: true, comments: data[recipeId].comments });
});


app.get('/api/get-recipe-by-index', async (req, res) => {
    const index = parseInt(req.query.id); // id=1,2,3 etc.
    if (isNaN(index)) {
        return res.status(400).json({ error: 'Invalid index provided' });
    }

    try {
        const recipes = await Recipe.find({});
        if (index < 1 || index > recipes.length) {
            return res.status(404).json({ error: 'Recipe not found for the given index' });
        }

        const recipe = recipes[index - 1]; // subtract 1 to convert to zero-based index
        res.json(recipe);
    } catch (error) {
        console.error('Error fetching recipe by index:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/all-recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ _id: -1 }); // latest first
        res.json(recipes);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

// Endpoint to delete a comment
app.post('/api/delete-comment', (req, res) => {
    const { recipeId, commentIndex } = req.body;
    const data = loadData();
  
    if (!data[recipeId]) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
  
    if (commentIndex >= 0 && commentIndex < data[recipeId].comments.length) {
      data[recipeId].comments.splice(commentIndex, 1);
      saveData(data);
      return res.json({ success: true, comments: data[recipeId].comments });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid comment index' });
    }
  });
  
  app.delete('/recipes/:id', async (req, res) => {
    try {
        const result = await Recipe.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).send("Recipe not found.");
        }
        res.send("Recipe deleted successfully.");
    } catch (err) {
        console.error("Error deleting recipe:", err);
        res.status(500).send("Server error.");
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});