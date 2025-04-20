console.log("showRecipes.js loaded");

document.addEventListener("DOMContentLoaded", async () => {
    const recipeList = document.getElementById('recipeList');
    //recipeList.className = "row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4"; // 4 per row, gap between
    recipeList.className = "row row-cols-1 row-cols-lg-4 g-4";
    

    try {
        const res = await fetch('http://localhost:5000/api/all-recipes');
        const recipes = await res.json();

        console.log("Loaded recipes:", recipes); 
        
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'col';

            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="/uploads/${recipe.image}" class="card-img-top recipe-img img-thumbnail" alt="${recipe.title}">
                    <div class="card-body text-center">
                        <h5 class="recipe-title">${recipe.title}</h5>
                        <p class="name">
                                <span class="label">Uploaded by: </span>
                                <span class="username">${recipe.name || 'Anonymous'}</span>
                        </p>
                    </div>
                </div>
            `;
           
            recipeList.appendChild(card);
        });
    } catch (err) {
        console.error("Failed to load recipes", err);
        recipeList.innerHTML = '<p class="text-danger">Could not load recipes.</p>';
    }
});

function deleteRecipe(id) {
    if (confirm("Are you sure you want to delete this recipe?")) {
        fetch(`http://localhost:5000/recipes/${id}`, {
            method: "DELETE",
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            alert("Recipe deleted successfully!");

            //  Remove recipe from DOM
            const recipeElement = document.getElementById(`recipe-${id}`);
            if (recipeElement) {
                recipeElement.remove();
            }
        })
        .catch(error => {
            console.error("Error deleting recipe:", error);
            alert("Failed to delete recipe: " + error.message);
        });
    }
}

