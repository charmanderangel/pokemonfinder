const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('pokemon-search');
const pokemonInfo = document.getElementById('pokemon-info');
const pokemonList = document.getElementById('pokemon-list');

let allPokemon = [];

async function fetchAllPokemon() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await response.json();
        allPokemon = data.results;
    } catch (error) {
        console.error('Failed to fetch all Pokémon:', error);
    }
}

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    pokemonInfo.innerHTML = '';
    if (searchTerm.length > 0) {
        const filteredPokemon = allPokemon.filter(pokemon => pokemon.name.startsWith(searchTerm));
        displayPokemonList(filteredPokemon);
    } else {
        pokemonList.innerHTML = '';
    }
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            fetchPokemon(searchTerm);
            pokemonList.innerHTML = '';
        }
    }
});

function displayPokemonList(pokemonArray) {
    pokemonList.innerHTML = '';
    pokemonArray.forEach(pokemon => {
        const pokemonItem = document.createElement('div');
        pokemonItem.classList.add('pokemon-list-item');
        pokemonItem.textContent = pokemon.name;
        pokemonItem.addEventListener('click', () => {
            fetchPokemon(pokemon.name);
            pokemonList.innerHTML = '';
            searchInput.value = pokemon.name;
        });
        pokemonList.appendChild(pokemonItem);
    });
}

searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        fetchPokemon(searchTerm);
    }
});

async function fetchPokemon(searchTerm) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const data = await response.json();
        displayPokemon(data);
    } catch (error) {
        pokemonInfo.innerHTML = `<p>${error.message}</p>`;
    }
}

function displayPokemon(pokemon) {
    const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');
    const hiddenAbilities = pokemon.abilities.filter(ability => ability.is_hidden).map(ability => ability.ability.name).join(', ');

    pokemonInfo.innerHTML = `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>National Pokédex:</strong> ${pokemon.id}</p>
        <p><strong>Type:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
        <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Abilities:</strong> ${abilities}</p>
        <p><strong>Hidden Abilities:</strong> ${hiddenAbilities || 'None'}</p>
    `;
}

fetchAllPokemon();
