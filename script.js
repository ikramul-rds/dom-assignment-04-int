document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const recipeGrid = document.getElementById('recipe-grid');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    const recipeModal = document.getElementById('recipe-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalBody = document.getElementById('modal-body');
    const modalLoader = document.getElementById('modal-loader');

    // Scroll to Top elements
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    // Fetch recipes initially
    fetchRecipes('');

    // Event Listeners
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        fetchRecipes(query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            fetchRecipes(query);
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    recipeModal.addEventListener('click', (e) => {
        if (e.target === recipeModal || e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });

    // Scroll to Top Logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.remove('hidden');
        } else {
            scrollToTopBtn.classList.add('hidden');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Fetch Recipes Function
    async function fetchRecipes(query) {
        showLoader();
        hideError();
        recipeGrid.innerHTML = ''; // Clear previous

        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
            const data = await response.json();

            if (data.meals) {
                displayRecipes(data.meals);
            } else {
                showError();
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            showError();
        } finally {
            hideLoader();
        }
    }

    // Display Recipes Function
    function displayRecipes(meals) {
        meals.forEach(meal => {
            const card = document.createElement('div');
            card.className = 'recipe-card';

            card.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" class="recipe-image">
                <div class="recipe-info">
                    <span class="recipe-category">${meal.strCategory} • ${meal.strArea}</span>
                    <h3 class="recipe-title">${meal.strMeal}</h3>
                    <span class="recipe-instructions">${meal.strInstructions.slice(0, 100)}</span>
                    <button class="btn-view" data-id="${meal.idMeal}">View details</button>
                </div>
            `;

            recipeGrid.appendChild(card);
        });

        // Add event listeners to all view buttons
        const viewButtons = document.querySelectorAll('.btn-view');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                openModal(id);
            });
        });
    }

    // Modal Functions
    async function openModal(id) {
        recipeModal.classList.remove('hidden');
        modalBody.innerHTML = '';
        modalLoader.classList.remove('hidden');

        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const data = await response.json();

            if (data.meals && data.meals.length > 0) {
                displayRecipeDetails(data.meals[0]);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            modalBody.innerHTML = '<div class="error-message"><h2>Failed to load details</h2></div>';
        } finally {
            modalLoader.classList.add('hidden');
        }
    }

    function closeModal() {
        recipeModal.classList.add('hidden');
    }

    function displayRecipeDetails(meal) {
        // Extract ingredients and measures
        let ingredientsHTML = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];

            if (ingredient && ingredient.trim() !== '') {
                ingredientsHTML += `<li>${measure} ${ingredient}</li>`;
            }
        }

        const tags = meal.strTags ? meal.strTags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') : '';

        modalBody.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="modal-header-img">
            <h2 class="modal-title">${meal.strMeal}</h2>
            
            <div class="modal-tags">
                <span class="tag">${meal.strCategory}</span>
                <span class="tag">${meal.strArea}</span>
                ${tags}
            </div>

            <h3 style="margin-bottom: 0.5rem; color: var(--accent-color);">Ingredients</h3>
            <ul class="ingredients-list">
                ${ingredientsHTML}
            </ul>

            <h3 style="margin: 1.5rem 0 0.5rem 0; color: var(--accent-color);">Instructions</h3>
            <p class="instructions">${meal.strInstructions}</p>
        `;
    }

    // Utility Functions
    function showLoader() {
        loader.classList.remove('hidden');
    }

    function hideLoader() {
        loader.classList.add('hidden');
    }

    function showError() {
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
});
