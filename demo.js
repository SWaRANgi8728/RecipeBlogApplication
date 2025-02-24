// Show the recipe upload form when the 'Submit Recipe' button is clicked
/*document.getElementById("showFormButton").addEventListener("click", function() {
    document.getElementById("uploadForm").style.display = "block";
});

// Show the recipe upload form when the 'Upload Recipe' nav item is clicked
document.getElementById("uploadRecipeNav").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent default link behavior
    document.getElementById("uploadForm").style.display = "block";
});*/

// Handle search functionality when search button is clicked
document.getElementById('searchBtn').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();

    if (!query) {
        alert("Please enter a recipe name to search.");
        return;  
    }

    try {
        // Fetch search results from the server
        const response = await fetch(`http://localhost:5000/search-recipes?q=${query}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }

        // Parse the JSON response
        const recipes = await response.json();

        // If no recipes found
        if (recipes.length === 0) {
            document.getElementById('recipeResults').innerHTML = '<p>No recipes found!</p>';
            return;
        }

        // Create HTML to display recipes
        let html = '';
        recipes.forEach(recipe => {
            html += `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="/uploads/${recipe.image}" class="card-img-top" alt="${recipe.title}">
                        <div class="card-body">
                            <h5 class="card-title">${recipe.title}</h5>
                            <p class="card-text">${recipe.cuisine} | Difficulty: ${recipe.difficulty}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        // Insert recipe results into the page
        document.getElementById('recipeResults').innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while searching for recipes.');
    }
});


