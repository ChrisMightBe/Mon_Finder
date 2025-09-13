function formatForApi(name){
    return name
        .trim()
        .toLowerCase()
        .replace(/[\s.']/g, "-") // spaces, dots, apostrophes to dash
        .replace(/[^a-z0-9-]/g, ""); // remove other special chars
}

const allTypes = [
    "normal","fire","water","electric","grass","ice","fighting","poison",
  "ground","flying","psychic","bug","rock","ghost","dragon","dark",
  "steel","fairy"
];


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
        const types = data.types.map(t => t.type.name);
        const abilities = data.abilities.map(a => a.ability.name).join(", ");

        pInfoDiv.innerHTML = `
            <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}" />
            <p><strong>Type(s):</strong> ${types.join(", ")}</p>
            <p><strong>Abilities:</strong> ${abilities}</p>
        `;

        await calculateEffectiveness(types[0], types[1] || null, pInfoDiv);
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
            <p><strong>Pokémon with this ability:</strong> ${data.pokemon.map(p => p.pokemon.name).join(", ")}</p>
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


document.addEventListener("DOMContentLoaded", function(){
    const input1 = document.getElementById("tSearchInput1");
    const input2 = document.getElementById("tSearchInput2");
    if(input1){
        input1.addEventListener("keypress", function(event) {
            if(event.key === "Enter"){
                triggerTypeEffectiveness();
            }
        });
    }
    if(input2){
        input2.addEventListener("keypress", function(event) {
            if(event.key === "Enter"){
                triggerTypeEffectiveness();
            }
        });
    }
});


async function getTypeData(type){
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    if(!res.ok) throw new Error(`Type ${type} not found.`);
    return res.json(); 
}

function triggerTypeEffectiveness(){
    const type1 = document.getElementById("tSearchInput1").value;
    const type2 = document.getElementById("tSearchInput2").value;
    const typeInfoDiv = document.getElementById("typeInfo");
    calculateEffectiveness(type1, type2, typeInfoDiv);

}

async function calculateEffectiveness(type1, type2, container) {
    

    try {
        const typeData1 = type1 ? await getTypeData(type1) : null;
        const typeData2 = type2 ? await getTypeData(type2) : null;

        let effectiveness = {};

        allTypes.forEach(t => effectiveness[t] = 1);

        if(typeData1){
            typeData1.damage_relations.double_damage_from.forEach(t => effectiveness[t.name] *= 2);
            typeData1.damage_relations.half_damage_from.forEach(t => effectiveness[t.name] *= 0.5);
            typeData1.damage_relations.no_damage_from.forEach(t => effectiveness[t.name] = 0);
        }

        if(typeData2){
            typeData2.damage_relations.double_damage_from.forEach(t => effectiveness[t.name] *= 2);
            typeData2.damage_relations.half_damage_from.forEach(t => effectiveness[t.name] *= 0.5);
            typeData2.damage_relations.no_damage_from.forEach(t => effectiveness[t.name] = 0);
        }

        let resultHTML = `<h2>Type Effectiveness</h2>`;
        resultHTML += `<p><strong>Against ${type1}${type2 ? " / " + type2 : ""}:</strong></p><ul>`;
        for(const [type, mult] of Object.entries(effectiveness)){
            if(mult > 1){
                resultHTML += `<li>${type.charAt(0).toUpperCase() + type.slice(1)}: ${mult}x damage (super effective)</li>`;
            }
            else if(mult < 1 && mult > 0){
                resultHTML += `<li>${type.charAt(0).toUpperCase() + type.slice(1)}: ${mult}x damage (not very effective)</li>`;
            }
            else if(mult === 0){
                resultHTML += `<li>${type.charAt(0).toUpperCase() + type.slice(1)}: no damage (immune)</li>`;
            }
        }
        resultHTML += `</ul>`;
        container.innerHTML += resultHTML;

    } catch (error) {
        container.innerHTML = `<p style="color:red;">${error.message}</p>`;

    }
}


document.addEventListener("DOMContentLoaded", function(){
    const input = document.getElementById("mSearchInput");
    if(input){
        input.addEventListener("keypress", function(event) {
            if(event.key === "Enter"){
                searchMove();
            }
        });
    }
});

async function searchMove() {
    const name = document.getElementById("mSearchInput").value;
    const input = formatForApi(name);
    const moveInfoDiv = document.getElementById("moveInfo");
    moveInfoDiv.innerHTML = "";
    if (!name) {
        moveInfoDiv.innerHTML = `<p style="color:red;">Please enter a move.</p>`;
        return;
    }
    try{
        const response = await fetch(`https://pokeapi.co/api/v2/move/${input}`);
        if(!response.ok) throw new Error("Move not found. Try again.");

        const data= await response.json();
        const effectEntry = data.effect_entries.find(entry => entry.language.name === "en");
        const effect = effectEntry ? effectEntry.effect : "No effect description available.";
        moveInfoDiv.innerHTML = `
            <h2>${name}</h2>
            <p><strong>Type:</strong> ${data.type.name}</p> 
            <p><strong>Power:</strong> ${data.power || "N/A"}</p>
            <p><strong>Accuracy:</strong> ${data.accuracy || "N/A"}</p>
            <p><strong>PP:</strong> ${data.pp}</p>
            <p><strong>Effect:</strong> ${effect}</p>
        `;
    } catch (error) {
        moveInfoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}