const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('pokemon-search');
const pokemonInfo = document.getElementById('pokemon-info');
const pokemonList = document.getElementById('pokemon-list');
const evolutionChainContainer = document.getElementById('evolution-chain');
const randomBtn = document.getElementById('random-btn');
const battleZone = document.createElement('div');
battleZone.id = 'battle-zone';
document.querySelector('.container').appendChild(battleZone);


let allPokemon = [];
let battlePair = [];

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
    const speed = pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat;

    pokemonInfo.innerHTML = `
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>National Pokédex:</strong> ${pokemon.id}</p>
        <p><strong>Type:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
        <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Speed:</strong> ${speed}</p>
        <p><strong>Abilities:</strong> ${abilities}</p>
        <p><strong>Hidden Abilities:</strong> ${hiddenAbilities || 'None'}</p>
        <div class="button-group">
            <button id="card-btn">Show Card</button>
            <button id="battle-select-btn">Select for Battle</button>
        </div>
    `;

    const cardBtn = document.getElementById('card-btn');
    const battleSelectBtn = document.getElementById('battle-select-btn');
    cardBtn.addEventListener('click', () => {
        fetchPokemonCard(pokemon.name);
    });

    battleSelectBtn.addEventListener('click', () => {
        addPokemonToBattle(pokemon);
    });
}

async function fetchPokemonCard(pokemonName) {
    const existingCard = document.getElementById('pokemon-card-container');
    if (existingCard) {
        existingCard.remove();
    }

    try {
        const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${pokemonName}"`);
        if (!response.ok) {
            throw new Error('Could not fetch Pokémon card data.');
        }
        const cardData = await response.json();

        if (cardData.data.length === 0) {
            // Try searching for the base form if it's a regional variant or special form
            const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            const pokemonData = await pokemonResponse.json();
            const speciesResponse = await fetch(pokemonData.species.url);
            const speciesData = await speciesResponse.json();
            const baseName = speciesData.name;

            if (baseName !== pokemonName) {
                return fetchPokemonCard(baseName); // Recursively search with the base name
            }

            throw new Error('No trading card found for this Pokémon.');
        }

        const cardImageUrl = cardData.data[0].images.large;

        const cardContainer = document.createElement('div');
        cardContainer.id = 'pokemon-card-container';
        cardContainer.innerHTML = `
            <div class="card-modal">
                <span class="close-btn">&times;</span>
                <img src="${cardImageUrl}" alt="${pokemonName} Card">
            </div>
        `;
        document.body.appendChild(cardContainer);

        const closeBtn = cardContainer.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            cardContainer.remove();
        });

        cardContainer.addEventListener('click', (e) => {
            if (e.target === cardContainer) {
                cardContainer.remove();
            }
        });

    } catch (error) {
        alert(error.message);
    }
}

function addPokemonToBattle(pokemon) {
    if (battlePair.length >= 2) {
        alert("You already have two Pokémon selected for battle. Please clear the selection to add new ones.");
        return;
    }
    if (battlePair.some(p => p.id === pokemon.id)) {
        alert(`${pokemon.name} is already selected.`);
        return;
    }

    battlePair.push(pokemon);
    updateBattleZone();
}

function updateBattleZone() {
    battleZone.innerHTML = '<h3>Battle Zone</h3>';
    const fightersContainer = document.createElement('div');
    fightersContainer.classList.add('fighters-container');

    battlePair.forEach((pokemon, index) => {
        const fighterDiv = document.createElement('div');
        fighterDiv.classList.add('fighter');
        fighterDiv.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>${pokemon.name}</p>
            <button class="remove-btn" data-index="${index}">&times;</button>
        `;
        fightersContainer.appendChild(fighterDiv);
    });

    battleZone.appendChild(fightersContainer);

    if (battlePair.length > 0) {
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clear-battle-btn';
        clearBtn.textContent = 'Clear Selection';
        battleZone.appendChild(clearBtn);
        clearBtn.addEventListener('click', () => {
            battlePair = [];
            updateBattleZone();
        });
    }

    if (battlePair.length === 2) {
        const startBattleBtn = document.createElement('button');
        startBattleBtn.id = 'start-battle-btn';
        startBattleBtn.textContent = 'Start Battle!';
        battleZone.appendChild(startBattleBtn);
        startBattleBtn.addEventListener('click', startBattle);
    }

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            battlePair.splice(index, 1);
            updateBattleZone();
        });
    });
}

function startBattle() {
    const [p1, p2] = battlePair;

    // Hide main container, show battle screen
    const mainContainer = document.querySelector('.container');
    mainContainer.style.display = 'none';

    let battleScreen = document.getElementById('battle-screen');
    if (!battleScreen) {
        battleScreen = document.createElement('div');
        battleScreen.id = 'battle-screen';
        document.body.appendChild(battleScreen);
    }

    battleScreen.style.display = 'flex';
    battleScreen.innerHTML = `
        <div class="battle-pokemon pokemon-1">
            <p>${p1.name}</p>
            <img src="${p1.sprites.back_default || p1.sprites.front_default}" alt="${p1.name}">
            <div class="hp-bar"><div class="hp" style="width: 100%;"></div></div>
        </div>
        <div class="battle-pokemon pokemon-2">
            <p>${p2.name}</p>
            <img src="${p2.sprites.front_default}" alt="${p2.name}">
            <div class="hp-bar"><div class="hp" style="width: 100%;"></div></div>
        </div>
        <div id="battle-log">The battle between ${p1.name} and ${p2.name} is about to begin!</div>
        <button id="back-to-main">End Battle</button>
    `;

    document.getElementById('back-to-main').addEventListener('click', () => {
        battleScreen.style.display = 'none';
        mainContainer.style.display = 'block';
        battlePair = [];
        updateBattleZone();
    });

    // Simple battle logic
    const p1Stats = {
        hp: p1.stats.find(s => s.stat.name === 'hp').base_stat,
        attack: p1.stats.find(s => s.stat.name === 'attack').base_stat,
        defense: p1.stats.find(s => s.stat.name === 'defense').base_stat,
    };
    const p2Stats = {
        hp: p2.stats.find(s => s.stat.name === 'hp').base_stat,
        attack: p2.stats.find(s => s.stat.name === 'attack').base_stat,
        defense: p2.stats.find(s => s.stat.name === 'defense').base_stat,
    };

    let p1CurrentHp = p1Stats.hp;
    let p2CurrentHp = p2Stats.hp;
    const battleLog = document.getElementById('battle-log');

    const battleTurn = (attacker, defender, attackerStats, defenderStats, defenderHpElement, defenderPokemonElement) => {
        const damage = Math.max(1, Math.floor(attackerStats.attack * (1 - defenderStats.defense / 200)));
        defenderStats.hp -= damage;
        const hpPercent = Math.max(0, (defenderStats.hp / (defender === p1 ? p1Stats.hp : p2Stats.hp)) * 100);
        defenderHpElement.style.width = `${hpPercent}%`;
        
        const logMessage = document.createElement('p');
        logMessage.textContent = `${attacker.name} attacks! ${defender.name} takes ${damage} damage.`;
        battleLog.appendChild(logMessage);
        battleLog.scrollTop = battleLog.scrollHeight;

        if (defenderStats.hp <= 0) {
            defenderPokemonElement.classList.add('fainted');
            const winnerMessage = document.createElement('p');
            winnerMessage.textContent = `${defender.name} fainted! ${attacker.name} wins!`;
            battleLog.appendChild(winnerMessage);
            battleLog.scrollTop = battleLog.scrollHeight;
            return true; // Battle over
        }
        return false;
    };

    const p1Element = document.querySelector('.pokemon-1');
    const p2Element = document.querySelector('.pokemon-2');
    const p1HpElement = p1Element.querySelector('.hp');
    const p2HpElement = p2Element.querySelector('.hp');

    const intervalId = setInterval(() => {
        if (battleTurn(p1, p2, p1Stats, {hp: p2CurrentHp, defense: p2Stats.defense}, p2HpElement, p2Element)) {
            p2CurrentHp = 0;
            clearInterval(intervalId);
            return;
        }
        p2CurrentHp -= Math.max(1, Math.floor(p1Stats.attack * (1 - p2Stats.defense / 200)));


        setTimeout(() => {
            if (battleTurn(p2, p1, p2Stats, {hp: p1CurrentHp, defense: p1Stats.defense}, p1HpElement, p1Element)) {
                p1CurrentHp = 0;
                clearInterval(intervalId);
                return;
            }
            p1CurrentHp -= Math.max(1, Math.floor(p2Stats.attack * (1 - p1Stats.defense / 200)));
        }, 1000);
    }, 2000);
}


fetchAllPokemon();
