app = {};

app.init = function() {
	app.smoothScrollFromHeader();
	app.drinkGlass();
	app.getDrinksByName();
	app.getDrinksByAlcohol();
	app.getDrinksByIngredient();
	app.populateSpotlight();
	app.accessibleSpotlight();

	// separated these so it runs once on load
	app.getDrinksByRandom();
	app.getDrinksByRandomListenerEvent();

	app.mockTail();
	app.hamburger();
	app.mobileFunctionality();
};

$(function() {
	app.init();
});

//Function for scrolling the page to the appropriate section when the user clicks anywhere on the header.
app.smoothScrollFromHeader = function() {
	$("header").on("click", function() {
		$("html,body").animate(
			{
				scrollTop: $("main").offset().top
			},
			"slow"
		);
	});
};

// setting position of the drink glass to be visible when i'm at the bottom of the header
app.drinkGlass = function() {
	$(window).on("scroll", function() {
		let scrollTop = $(window).scrollTop();

		if (scrollTop >= 100) {
			$(".decoration")
				.stop()
				.animate({ top: "68vh" }, 350);
			$(".decoration2").css("opacity", 0);
		} else {
			$(".decoration")
				.stop()
				.animate({ top: "60vh" }, 350);
			$(".decoration2").css("opacity", 1);
		}
	});
};
//Function to give the user a selection of drinks based on their search parameter displayed to the right of the userInput
app.getDrinksByName = function() {
	$("form.drinksByNameForm").on("submit", function(e) {
		e.preventDefault();
		const userDrinksInput = $("#drinksByName").val();
		$.ajax({
			url: "https://www.thecocktaildb.com/api/json/v1/1/search.php",
			method: "GET",
			dataType: "json",
			data: {
				s: userDrinksInput
			}
		}).then(function(response) {
			if (userDrinksInput != "") {
				if (response.drinks === null) {
					//This catches when the response returned is empty
					app.switchToGallery();
					htmlToAppend = `<h2 class="noResults">Your search didn't find anything, please alter your search.</h2>`;
					$(".drinkGallery ul").append(htmlToAppend);
				} else {
					app.populateGallery(response);
				}
			} else {
				//This catches when the user submits an empty input
				app.switchToGallery();
				htmlToAppend = `<h2 class="noResults">Your search was empty, please alter your search.</h2>`;
				$(".drinkGallery ul").append(htmlToAppend);
			}
		});
	});
};
//Function to give the user a selection of drinks based on their search parameter displayed to the right of the userInput
app.getDrinksByAlcohol = function() {
	$("form.drinksByAlcoholForm").on("submit", function(e) {
		e.preventDefault();
		const userAlcoholInput = $("#drinksByAlcohol").val();
		$.ajax({
			url: "https://www.thecocktaildb.com/api/json/v1/1/filter.php",
			method: "GET",
			dataType: "json",
			data: {
				i: userAlcoholInput
			}
		})
			.then(function(response) {
				if (userAlcoholInput != "") {
					app.populateGallery(response);
				} else {
					//This catches when the user submits an empty input
					app.switchToGallery();
					htmlToAppend = `<h2 class="noResults">Your search was empty, please alter your search.</h2>`;
					$(".drinkGallery ul").append(htmlToAppend);
				}
			})
			.fail(function(response) {
				//This catches when the response returned is empty
				app.switchToGallery();
				htmlToAppend = `<h2 class="noResults">Your search didn't find anything, please alter your search.</h2>`;
				$(".drinkGallery ul").append(htmlToAppend);
			});
	});
};
//Function to give the user a selection of drinks based on their search parameter displayed to the right of the userInput. If the user gives 2 inputs, the selection given will only be drinks that contain both ingredients.
app.getDrinksByIngredient = function() {
	$("form.drinksByIngredientForm").on("submit", function(e) {
		e.preventDefault();
		const userIngredientInput1 = $("#drinksByIngredient1").val();
		const userIngredientInput2 = $("#drinksByIngredient2").val();

		if (!userIngredientInput1 && !userIngredientInput2) {
			app.switchToGallery();
			htmlToAppend = `<h2 class="noResults">Your search was empty, please alter your search.</h2>`;
			$(".drinkGallery ul").append(htmlToAppend);
		}

		const $call1 = $.ajax({
			url: "https://www.thecocktaildb.com/api/json/v1/1/filter.php",
			method: "GET",
			dataType: "json",
			data: {
				i: userIngredientInput1
			}
		});
		const $call2 = $.ajax({
			url: "https://www.thecocktaildb.com/api/json/v1/1/filter.php",
			method: "GET",
			dataType: "json",
			data: {
				i: userIngredientInput2
			}
		});
		if (userIngredientInput1 && !userIngredientInput2) {
			$call1
				.then(function(response1) {
					app.populateGallery(response1);
				})
				//This catches when the response is empty
				.fail(function(response) {
					app.switchToGallery();
					htmlToAppend = `<h2 class="noResults">Your search didn't find anything, please alter your search.</h2>`;
					$(".drinkGallery ul").append(htmlToAppend);
				});
		} else if (!userIngredientInput1 && userIngredientInput2) {
			$call2
				.then(function(response2) {
					app.populateGallery(response2);
				})
				//This catches when the response is empty
				.fail(function(response) {
					app.switchToGallery();
					htmlToAppend = `<h2 class="noResults">Your search didn't find anything, please alter your search.</h2>`;
					$(".drinkGallery ul").append(htmlToAppend);
				});
		} else if (userIngredientInput1 && userIngredientInput2) {
			const finalArray = { drinks: [] };
			
			$.when($call1, $call2)
				.done(function(drinksArray1, drinksArray2) {
					differentArray = drinksArray1[0].drinks.filter(function(itemFromArray1) {
						drinksArray2[0].drinks.forEach(function(itemFromArray2) {
							if (itemFromArray1.idDrink === itemFromArray2.idDrink) {
								finalArray.drinks.push(itemFromArray1);
							}
						});
					});
					console.log(finalArray.drinks)
					//checking to see if the search resulted in anything
					if (finalArray.drinks.length > 0) {
						app.populateGallery(finalArray);
					} else if (finalArray.drinks.length === 0) {
						app.switchToGallery();
            htmlToAppend = `<h2 class="noResults">Your search didn't find anything, please alter your search.</h2>`;
            $(".drinkGallery ul").append(htmlToAppend);
					}
					
					
				})
				//This catches when the response is empty
				.fail(function(response) {
					app.switchToGallery();
					htmlToAppend = `<h2 class="noResults">Your search didn't find anything, please alter your search.</h2>`;
					$(".drinkGallery ul").append(htmlToAppend);
				});
		}
	});
};
//This function will bring the user away from the user input section and be presented with a drink information page on a random drink with the data obtained from an ajax call
app.getDrinksByRandomListenerEvent = function() {
	$(".feelingLuckyButton").on("click", function(event) {
		event.preventDefault();
		app.getDrinksByRandom();
	});
};
//Basic function that allows the user to find information on a specific alcoholic or non-alcoholic drink that they know the name to.
app.getDrinksByRandom = function() {
	$.ajax({
		url: "https://www.thecocktaildb.com/api/json/v1/1/random.php",
		method: "GET",
		dataType: "json"
	}).then(function(response) {
		$(".ingredientList").empty();
		const drinkInstruction = response.drinks[0].strInstructions;
		const drinkName = response.drinks[0].strDrink;
		const drinkGlass = response.drinks[0].strGlass;
		const drinkUrl = response.drinks[0].strDrinkThumb;
		const { strIngredient1, strIngredient2, idDrink } = response.drinks[0];
		for (i = 0; i <= 15; i++) {
			ingredientType = `strIngredient${i}`;
			ingredientAmount = `strMeasure${i}`;

			if (response.drinks[0][ingredientType]) {
				const coolWhip = `
					<li>
						<p>${response.drinks[0][ingredientType]} ${response.drinks[0][ingredientAmount]}</p>
					</li>
				`;
				$(".ingredientList").append(coolWhip);
			}
		}
		$(".howToMixIt").html(drinkInstruction);
		$(".drinkSpotlight .drinkName").html(drinkName);
		$(".drinkSpotlight .glassType").html(drinkGlass);
		$(".drinkSpotlight img").attr("src", `${drinkUrl}`);
		$(".drinkGallery").css("display", "none");
		$(".drinkSpotlight").css("display", "block");
		app.populateRelatedDrinks(strIngredient1, strIngredient2, idDrink);
		$(".drinkSpotlight").css("opacity", "1");
	});
};
//This function will populate the gallery to the right of the user input section with the data obtained from an ajax call
app.populateGallery = function(response) {
	app.switchToGallery();
	if (response) {
		let i = 0;
		let countDown = 18;
		modArray = response.drinks.slice(0, 18);
		//disabling buttons while the gallery populates, don't want overzealous users over clicking and sending a billion API calls
		let anotherCount = 0;
		$(`button[type="submit"]`).prop("disabled", true);
		modArray.forEach(function(item) {
			i++;
			const drinkTitle = item.strDrink;
			const drinkID = item.idDrink;
			const drinkUrl = item.strDrinkThumb;
			let htmlToAppend;
			if (response.drinks.length < 6) {
				$(".drinkGallery ul").css("align-content", "space-evenly");
			}
			if (response.drinks.length < 3) {
				$(".drinkGallery ul").css("justify-content", "center");
			}
			if (response.drinks.length < 18 && response.drinks.length % 3 != 0) {
				$(".drinkGallery ul").css({
					"align-content": "flex-start",
					"justify-content": "flex-start"
				});
				htmlToAppend = `
				<li data-id="${drinkID}" class="drinkGalleryItem appearJS wide" tabindex="0">
				<h3>${drinkTitle}</h3>
				<img src="${drinkUrl}" alt="${drinkTitle}" />
				</li>
				`;
			} else {
				$(".drinkGallery ul").css({
					"align-content": "flex-start",
					"justify-content": "flex-start"
				});
				htmlToAppend = `
			<li data-id="${drinkID}" class="drinkGalleryItem appearJS" tabindex="0">
			<h3>${drinkTitle}</h3>
			<img src="${drinkUrl}" alt="${drinkTitle}" />
			</li>
			`;
			}
			setTimeout(function() {
				$(".drinkGallery ul").append(htmlToAppend);
				countDown -= 1;
				anotherCount++;
				//re-enabling the button once the gallery is loaded
				if (anotherCount >= modArray.length) {
					$(`button[type="submit"]`).prop("disabled", false);
				}
			}, 200 + i);
			i += 200;
		});
	}
};

//This function ensures the smooth transition between the more detailed drink spotlight and the gallery.
app.switchToGallery = function() {
	$(".drinkGallery ul").empty();
	$(".drinkGallery").css("opacity", "1");
	$(".drinkGallery ul").css("opacity", "0");
	$(".drinkSpotlight").css("opacity", "0");
	setTimeout(function() {
		$(".drinkGallery").css("display", "block");
		$(".drinkSpotlight").css("display", "none");
		$(".drinkGallery ul").css("opacity", "1");
	}, 400);
};

//This function makes it so that in additional to clicking pressing down the enter key also works for clicking around
app.accessibleSpotlight = function() {
	$(".drinkGallery ul, .relatedDrinks ul").on("keyup", "li", function(event) {
		if (event.which === 13) {
			$(this).click();
		}
	});
};

//This function will bring the user away from the user input section and be presented with a drink construction information page on the drink of their choice with the data obtained from an ajax call
app.populateSpotlight = function() {
	$(".drinkGallery ul, .relatedDrinks ul	").on("click", "li", function() {
		$(".ingredientList").empty();
		app.switchToSpotlight();
		const spotlightID = $(this).data("id");
		$.ajax({
			url: "https://www.thecocktaildb.com/api/json/v1/1/lookup.php",
			method: "GET",
			dataType: "json",
			data: {
				i: spotlightID
			}
		}).then(function(response) {
			const drinkInstruction = response.drinks[0].strInstructions;
			const drinkName = response.drinks[0].strDrink;
			const drinkGlass = response.drinks[0].strGlass;
			const drinkUrl = response.drinks[0].strDrinkThumb;
			const { strIngredient1, strIngredient2 } = response.drinks[0];
			// variables to change to count li's and decide if we need to switch to two columns
			let columnSplit = 0;
			$(".ingredientList").css("column-count", 1);
			for (i = 0; i <= 15; i++) {
				ingredientType = `strIngredient${i}`;
				ingredientAmount = `strMeasure${i}`;
				// if there's an ingredient
				if (response.drinks[0][ingredientType]) {
					// set string to a variable
					let ingredientItem = `${response.drinks[0][ingredientType]} ${response.drinks[0][ingredientAmount]}`;

					// if there isn't a measurement amount for an ingredient, prevent it from writing 'null' in the string
					ingredientItem = ingredientItem.replace("null", "");

					const htmlToAppend = `
						<li>
							<p>${ingredientItem}</p>
						</li>
					`;
					$(".ingredientList").append(htmlToAppend);
					columnSplit++;
					if (columnSplit > 7) {
						$(".ingredientList").css("column-count", 2);
					}
				}
			}
			// finally we have all the info needed to populate things
			$(".howToMixIt").html(drinkInstruction);
			$(".drinkSpotlight .drinkName").text(drinkName);
			$(".drinkSpotlight .glassType").text(drinkGlass);
			$(".drinkSpotlight h2, .imgContainer, .ingredientParent, .instructionParent").css("opacity", "0");
			$(".drinkSpotlight img")
				.attr("src", `${drinkUrl}`)
				.attr("alt", drinkName);
			setTimeout(function() {
				$(".drinkSpotlight h2, .imgContainer, .ingredientParent, .instructionParent").css("opacity", "1");
			}, 400);

			app.populateRelatedDrinks(strIngredient1, strIngredient2, spotlightID);
		});
	});
};

//This function ensures the smooth transition between the more detailed drink spotlight and the gallery.
app.switchToSpotlight = function() {
	$(".drinkGallery").css("opacity", "0");
	$(".drinkSpotlight").css("opacity", "1");
	$(".drinkSpotlight h2, .imgContainer, .ingredientParent, .instructionParent").css("opacity", "0");
	setTimeout(function() {
		$(".drinkGallery").css("display", "none");
		$(".drinkSpotlight").css("display", "block");
		$(".drinkSpotlight h2, .imgContainer, .ingredientParent, .instructionParent").css("opacity", "1");
	}, 400);
};

// give user a list of related drinks based on the first two ingredients
app.populateRelatedDrinks = function(ingredient1, ingredient2, originalID) {
	$(".relatedDrinks ul").empty();
	// create first ingredient response
	const $call1 = $.ajax({
		url: "https://www.thecocktaildb.com/api/json/v1/1/filter.php",
		method: "GET",
		dataType: "json",
		data: {
			i: ingredient1
		}
	});
	// create second ingredient response
	const $call2 = $.ajax({
		url: "https://www.thecocktaildb.com/api/json/v1/1/filter.php",
		method: "GET",
		dataType: "json",
		data: {
			i: ingredient2
		}
	});

	$.when($call1, $call2).done(function(drinksArray1, drinksArray2) {
		// initializing these for comparison logic later
		// const finalArray = [];
		let finalArray;
		let longerArray;
		let shorterArray;
		// need to find out which is longer
		const concatArray = [...drinksArray1[0].drinks, ...drinksArray2[0].drinks];
		const filteredArray = concatArray.filter(item => {
			if (item.idDrink != originalID) {
				return item;
			}
		});
		// checking to only return unique values
		finalArray = filteredArray.filter((item, index, originalArray) => {
			return originalArray.indexOf(item) === index;
		});

		// append these drinks to the related drinks ul
		for (let i = 0; i < 4; i++) {
			let randomNumber = Math.floor(Math.random() * finalArray.length);
			const { idDrink, strDrink, strDrinkThumb } = finalArray[randomNumber];
			htmlToAppend = `
				<li data-id="${idDrink}" class="appearJS" tabindex="0">
				<h3>${strDrink}</h3>
				<img src="${strDrinkThumb}" alt="${strDrink}" />
				</li>
				`;

			finalArray.splice(randomNumber, 1);
			$(".relatedDrinks ul").append(htmlToAppend);
		}
	});
};

//this function randomizes the order of an array
app.shuffle = function(array1) {
	let ctr = array1.length,
		temp,
		index; // While there are elements in the array
	while (ctr > 0) {
		// Pick a random index
		index = Math.floor(Math.random() * ctr);
		// Decrease ctr by 1
		ctr--;
		// And swap the last element with it
		temp = array1[ctr];
		array1[ctr] = array1[index];
		array1[index] = temp;
	}
	return array1;
}; //this function populates the gallery with non-alcoholic drinks
app.mockTail = function() {
	$("button.mocktailButton").on("click", function() {
		$.ajax({
			url: "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic",
			method: "GET",
			dataType: "json"
		}).then(function(response) {
			const arrayToRandom = response.drinks;
			const finalArray = { drinks: app.shuffle(arrayToRandom) };
			app.populateGallery(finalArray);
		});
	});
};

//hamburger menu functionality
app.hamburger = function() {
	$(".hamburger").on("click", function() {
		$(".drinkFilters button").addClass("mobileButton");
		$(".drinkFilters").toggleClass("showDrinksFilter");
		$("body").toggleClass("hamburgerOpen");
		$(".hamburger")
			.children(".bar1, .bar2, .bar3")
			.toggleClass("animate");
		// otherwise users have to tab through the entire form before they can focus on the related drinks
		if ($(".drinkFilters").hasClass("showDrinksFilter") == true) {
			$(".drinkFilters button, .drinkFilters input").attr("tabindex", "0");
		} else {
			$(".drinkFilters button, .drinkFilters input").attr("tabindex", "-1");
		}
	});
};

// make sure the menu disappears when a button is clicked
app.mobileFunctionality = function() {
	$(".drinkFilters").on("click", ".mobileButton", function() {
		$(".drinkFilters").toggleClass("showDrinksFilter");
		$("body").toggleClass("hamburgerOpen");
		$(".hamburger")
			.children(".bar1, .bar2, .bar3")
			.toggleClass("animate");
		$(".drinkFilters button, .drinkFilters input").attr("tabindex", "-1");
	});
};
