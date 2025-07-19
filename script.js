const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('pokemon-search');
const pokemonInfo = document.getElementById('pokemon-info');
const pokemonList = document.getElementById('pokemon-list');
const evolutionChainContainer = document.getElementById('evolution-chain');
const randomBtn = document.getElementById('random-btn');

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
    evolutionChainContainer.innerHTML = '';
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

randomBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    const randomPokemonName = allPokemon[randomIndex].name;
    fetchPokemon(randomPokemonName);
    searchInput.value = randomPokemonName;
    pokemonList.innerHTML = '';
});

async function fetchPokemon(searchTerm) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const data = await response.json();
        displayPokemon(data);
        fetchEvolutionChain(data.species.url);
    } catch (error) {
        pokemonInfo.innerHTML = `<p>${error.message}</p>`;
    }
}

async function fetchEvolutionChain(speciesUrl) {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evolutionChainResponse = await fetch(evolutionChainUrl);
        const evolutionChainData = await evolutionChainResponse.json();
        displayEvolutionChain(evolutionChainData.chain);
    } catch (error) {
        console.error('Failed to fetch evolution chain:', error);
    }
}

async function displayEvolutionChain(chain) {
    evolutionChainContainer.innerHTML = '<h3>Evolution Line:</h3>';
    let current = chain;
    while (current) {
        const speciesName = current.species.name;
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesName}`);
        const pokemonData = await pokemonResponse.json();
        const pokemonSprite = pokemonData.sprites.front_default;

        const evolutionStage = document.createElement('div');
        evolutionStage.classList.add('evolution-stage');
        evolutionStage.innerHTML = `
            <img src="${pokemonSprite}" alt="${speciesName}">
            <p>${speciesName}</p>
        `;
        evolutionStage.addEventListener('click', () => {
            fetchPokemon(speciesName);
            searchInput.value = speciesName;
        });
        evolutionChainContainer.appendChild(evolutionStage);

        if (current.evolves_to.length > 0) {
            const arrow = document.createElement('div');
            arrow.classList.add('arrow');
            arrow.textContent = '→';
            evolutionChainContainer.appendChild(arrow);
        }

        current = current.evolves_to[0];
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
