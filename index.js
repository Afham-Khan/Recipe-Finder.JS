const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/"
const SEARCH_URL = `${BASE_URL}search.php?s=`
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`

searchBtn.addEventListener("click" , searchMeals)

mealsContainer.addEventListener("click", handleMealClick)

backBtn.addEventListener("click" ,  () => {
    mealDetails.classList.add("hidden")
})

searchInput.addEventListener("keypress" , (e) => {
    if (e.key === "Enter") 
        searchMeals()
})

//FOR LOADER= 

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}


async function searchMeals(params) {
    const searchTerm = searchInput.value.trim()

    if (!searchTerm) {
        errorContainer.textContent = "Please enter a search word 🙄"
        errorContainer.classList.remove("hidden")
        return;        /* ✅ return ka matlab hota hai function yahin pe ruk jaaye, niche ka code skip kar do. To agar user ne kuch nahi likha search box me:
                                                      Error message show karo Aur return kar do function se Taa ke API call waste na ho */
    }
 
  /* UI pe likha jata hai: “Searching for 'Biryani'...” Pichlay results delete ho jaate hain Agar pehle koi error dikha tha (jaise "404 not found") wo chhup jata hai
                         Phir backend se naye results la kar dikhaye jaate hain*/

    try {
        resultHeading.textContent = `Searching for "${searchTerm}"...`
        mealsContainer.innerHTML = "";
        errorContainer.classList.add("hidden") //hidden class laga do → taake element chhup jaye

           showLoader();

        const response = await fetch(`${SEARCH_URL}${searchTerm}`)
        const data = await response.json()
 setTimeout(() => {
        hideLoader();
        
 //no meals found= 
        if (data.meals === null) {
             resultHeading.textContent = ""
             mealsContainer.innerHTML = ""
             errorContainer.textContent = `No recipes found for "${searchTerm}".🤦🏼‍♂️ 
             Try another search term!`  
             errorContainer.classList.remove("hidden")  // hidden class hata do → taake element visible ho jay
 
            }
            

        else {
            resultHeading.textContent = `Search results for "${searchTerm}":`
            displayMeals(data.meals)
            searchInput.value= ""   //purane results htata hai    
        }
}, 1000);

    } catch (error) {
        hideLoader();
        errorContainer.textContent = "Sorry 😭 Something went wrong. Please try again later."
        errorContainer.classList.remove("hidden") 
    }
}

function displayMeals(meals) {
    mealsContainer.innerHTML = ""
      // loop through meals and create a card for each meal
  meals.forEach((meal) => {
    mealsContainer.innerHTML += `
      <div class="meal" data-meal-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="meal-info">
          <h3 class="meal-title">${meal.strMeal}</h3>
          ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
        </div>
      </div>
    `;
  });

} 

async function handleMealClick(e) {   
        //e means event (user ne kaha click kiya).
//.closest(".meal") — ye DOM tree mein upar jaa ke sabse nazdeek wali .meal class wali div dhoondta hai.

    const mealEl = e.target.closest(".meal")      //e.target — ye bataata hai user ne exactly kis element pe click kiya.
    if (!mealEl) 
        return
    
    const mealId = mealEl.getAttribute("data-meal-id")

try {
    const response = await fetch(`${LOOKUP_URL}${mealId}`)
    const data = await response.json()
    //console.log(data)
 
    if (data.meals && data.meals[0]) {
        const meal = data.meals[0]

        const ingredients = []

        for (let index = 1; index <= 20; index++) {
            if (meal[`strIngredient${index}`] && meal[`strIngredient${index}`].trim() !== "" ) {
                ingredients.push({
                      ingredient: meal[`strIngredient${index}`],
                      measure: meal[`strMeasure${index}`],
                })
                
            }
            
        }

         // display meal details
      mealDetailsContent.innerHTML = `
           <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
           <h2 class="meal-details-title">${meal.strMeal}</h2>
           <div class="meal-details-category">
             <span>${meal.strCategory || "Uncategorized"}</span>
           </div>
           <div class="meal-details-instructions">
             <h3>Instructions</h3>
             <p>${meal.strInstructions}</p>
           </div>
           <div class="meal-details-ingredients">
             <h3>Ingredients</h3>
             <ul class="ingredients-list">
               ${ingredients
                /* Ek array lo, uske har element pe operation karo, aur naya array bna do.  .join("") ka matlab hai array ko string mein convert karo bina kisi comma ke. */
                 .map(
                   (item) => `
                 <li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>
               `
                 )
                 .join("")}
             </ul>
           </div>
           ${
             meal.strYoutube
             //ternary opt=
               ? `                                                                           
             <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
               <i class="fab fa-youtube"></i> Watch Video
             </a>
           `
               : ""
           }
         `;
            mealDetails.classList.remove("hidden");
           mealDetails.scrollIntoView({ behavior: "smooth" });

    }


} catch (error) {
    errorContainer.textContent = "Could not load recipe details. Please try again later. 😰";
    errorContainer.classList.remove("hidden");

}

}