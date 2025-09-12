function formatForApi(name){
    return name
        .trim()
        .toLowerCase()
        .replace(/[\s.']/g, "-") // spaces, dots, apostrophes to dash
        .replace(/[^a-z0-9-]/g, ""); // remove other special chars
}

document.addEventListener("DOMContentLoaded", function(){
    const input = document.getElementById("pSearchInput");
    if(input){
        input.addEventListener("keypress", function(event) {
            if(event.key === "Enter"){
                searchPokemon();
            }
        });
    }
});

async function searchPokemon() {
    const name = document.getElementById("pSearchInput").value.toLowerCase();
    const pInfoDiv = document.getElementById("pokemonInfo");
    pInfoDiv.innerHTML = ""; 

     if (!name) {
        pInfoDiv.innerHTML = `<p style="color:red;">Please enter a Pokémon name.</p>`;
        return;
    }

    try{
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if(!response.ok) throw new Error("Pokemon not found. Try again.");

        const data= await response.json();
        const types = data.types.map(t => t.type.name).join(", ");
        const abilities = data.abilities.map(a => a.ability.name).join(", ");

        pInfoDiv.innerHTML = `
            <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}" />
            <p><strong>Type(s):</strong> ${types}</p>
            <p><strong>Abilities:</strong> ${abilities}</p>
        `;
    } catch (error) {
        pInfoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}


document.addEventListener("DOMContentLoaded", function(){
    const input = document.getElementById("aSearchInput");
    if(input){
        input.addEventListener("keypress", function(event) {
            if(event.key === "Enter"){
                searchAbility();
            }
        });
    }
});

async function searchAbility() {
    const name = document.getElementById("aSearchInput").value;
    const input = formatForApi(name);
    const aInfoDiv = document.getElementById("abilityInfo");
    aInfoDiv.innerHTML = "";

    if (!name) {
        aInfoDiv.innerHTML = `<p style="color:red;">Please enter an Ability.</p>`;
        return;
    }
    try{
        const response = await fetch(`https://pokeapi.co/api/v2/ability/${input}`);
        if(!response.ok) throw new Error("Ability not found. Try again.");

        const data= await response.json();
        const effectEntry = data.effect_entries.find(entry => entry.language.name === "en");
        const effect = effectEntry ? effectEntry.effect : "No effect description available.";

        aInfoDiv.innerHTML = `
            <h2>${name}</h2>
            <p><strong>Effect:</strong> ${effect}</p>
        `;
    } catch (error) {
        aInfoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}


document.addEventListener("DOMContentLoaded", function(){
    const input = document.getElementById("iSearchInput");
    if(input){
        input.addEventListener("keypress", function(event) {
            if(event.key === "Enter"){
                searchItem();
            }
        });
    }
});

async function searchItem() {
    const name = document.getElementById("iSearchInput").value;
    const input = formatForApi(name);
    const itemInfoDiv = document.getElementById("itemInfo");
    itemInfoDiv.innerHTML = "";
    if (!name) {
        itemInfoDiv.innerHTML = `<p style="color:red;">Please enter an item.</p>`;
        return;
    }
    try{
        const response = await fetch(`https://pokeapi.co/api/v2/item/${input}`);
        if(!response.ok) throw new Error("Item not found. Try again.");

        const data= await response.json();

        itemInfoDiv.innerHTML = `
            <h2>${name}</h2>
            <img src="${data.sprites.default}" alt="${data.input}" />
            <p><strong>Effect:</strong> ${data.effect_entries[0].effect}</p>
        `;
    }
    catch (error) {
        itemInfoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}