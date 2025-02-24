document.getElementById('recipeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('cuisine', document.getElementById('cuisine').value);
    formData.append('difficulty', document.getElementById('difficulty').value);
    formData.append('ingredients', document.getElementById('ingredients').value);
    formData.append('steps', document.getElementById('steps').value);
    formData.append('image', document.getElementById('image').files[0]);

    try {
        const response = await fetch('http://localhost:5000/upload-recipe', {  // Corrected endpoint
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Recipe uploaded successfully!');
            document.getElementById('recipeForm').reset();
        } else {
            alert('Failed to upload recipe!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while uploading the recipe!');
    }
});

// Handle search functionality (optional)
document.getElementById('searchBtn').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value;
    const response = await fetch(`/searchRecipes?q=${query}`);
    const recipes = await response.json();
    
    let html = '';
    recipes.forEach(recipe => {
        html += `
            <div class="card mb-3">
                <img src="/uploads/${recipe.image}" class="card-img-top" alt="${recipe.title}">
                <div class="card-body">
                    <h5 class="card-title">${recipe.title}</h5>
                    <p class="card-text">${recipe.cuisine} | Difficulty: ${recipe.difficulty}</p>
                </div>
            </div>
        `;
    });
    document.getElementById('recipeResults').innerHTML = html;
});



// Show the dropdown when the search input is focused
function showDifficultyDropdown() {
    document.getElementById('difficulty-dropdown').style.display = 'block';
}

// Hide the dropdown when the search input loses focus
function hideDifficultyDropdown() {
    setTimeout(function() {
        document.getElementById('difficulty-dropdown').style.display = 'none';
    }, 200); // Delay to allow click on the dropdown item
}

// Function to handle difficulty selection
function selectDifficulty(difficulty) {
    // Get the search input field
    const searchInput = document.getElementById('search-input');

    // Set the input value to the selected difficulty, replacing any previous value
    searchInput.value = difficulty; 

    // Hide the dropdown after selecting
    hideDifficultyDropdown();
}