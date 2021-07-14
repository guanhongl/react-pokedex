import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Container, Dropdown, Header, Image, Loader, Search } from 'semantic-ui-react';
import axios from 'axios';
import * as _ from 'underscore';

/**
 * the pokedex component
 */
class Pokedex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pokemon: {
                id: NaN,
                abilities: {},
                /** height in decimetres */
                height: NaN,
                name: '',
                sprite: '',
                stats: {},
                types: [],
                /** weight in hectograms */
                weight: NaN,
                forms: [],
                evolutions: [],
                /** TODO: pokemon info. (pokemon-species/{id or name} -> flavor_text_entries) */
            },
            pokemonList: [],
            isLoadingSingle: true,
            isLoadingAbilities: true,
            isLoadingForms: true,
            isLoadingEvolutions: true,
            isLoadingList: true,
            searchResults: [],
            searchQuery: '',
            /** TODO: previous button */
            prevPokemon: NaN,
        };
        this.getPokemon = this.getPokemon.bind(this);
        this.setPokemon = this.setPokemon.bind(this);
        this.getAbilityDesc = this.getAbilityDesc.bind(this);
        this.getAbilities = this.getAbilities.bind(this);
        this.getForms = this.getForms.bind(this);
        this.getEvolutions = this.getEvolutions.bind(this);
        this.getPokemonList = this.getPokemonList.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearchSelect = this.handleSearchSelect.bind(this);
        this.handleDropdown = this.handleDropdown.bind(this);
    }

    /**
     * fires on component mount
     */
    componentDidMount() {
        this.getPokemon('slowpoke');
        this.getPokemonList();
    }

    /**
     * fires on state change
     * @param prevProps
     * @param prevState
     */
    componentDidUpdate(prevProps, prevState) {
        if (prevState.pokemon.id !== this.state.pokemon.id) {
            console.log('id changed!')
            // this.setState({ prevPokemon: prevState.pokemon.id });
        }
    }

    /**
     * get Pokemon data
     * @param pokemon name
     * TODO: change to param id? (make /pokemon-species/ the base)
     */
    getPokemon(name) {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
            .then(response => {
                this.setPokemon(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    /**
     * populate PokemonList w/ pokemon names
     */
    getPokemonList() {
        axios.get('https://pokeapi.co/api/v2/pokemon-species/')
            .then(response => {
                const limit = response.data.count;
                // const limit = 100;
                axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`)
                    .then(response => {
                        const results = response.data.results;
                        const pokemonList = _.pluck(results, "name");
                        this.setState({ pokemonList, isLoadingList: false });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
            .catch(error => {
                console.log(error);
            });
    }

    /**
     * get ability description
     * @param ability name
     */
    getAbilityDesc(ability) {
        axios.get(`https://pokeapi.co/api/v2/ability/${ability}`)
            .then(response => {
                /** append new ability (key, val) to abilities obj */
                const abilities = this.state.pokemon.abilities;
                /** if effect entries is defined */
                try {
                    /** TODO: long description for effect? */
                    response.data.effect_entries[1].language.name === "en"
                    ? abilities[ability] = response.data.effect_entries[1].short_effect
                    : abilities[ability] = response.data.effect_entries[0].short_effect
                }
                /** else */
                catch(error) {
                    console.log(error);
                    abilities[ability] = response.data.flavor_text_entries[0].flavor_text;
                }
                /** update abilities state in pokemon */
                const pokemon = {...this.state.pokemon};
                pokemon.abilities = abilities;
                this.setState({ pokemon, isLoadingAbilities: false });
            })
            .catch(error => {
                console.log(error);
            });
    }

    /**
     * set Pokemon state
     * @param array data
     */
    setPokemon(data) {
        const pokemon = {};
        this.setState({ isLoadingAbilities: true }, this.getAbilities(data.abilities));
        this.setState({ isLoadingForms: true }, this.getForms(data.species.url));
        this.setState({ isLoadingEvolutions: true }, this.getEvolutions(data.species.url));

        pokemon.id = data.id;
        pokemon.abilities = {};
        pokemon.height = data.height;
        pokemon.name = data.name;
        pokemon.sprite = data.sprites.front_default;
        pokemon.stats = this.getStats(data.stats);
        pokemon.types = this.getTypes(data.types);
        pokemon.weight = data.weight;
        pokemon.forms = [];
        pokemon.evolutions = [];
        this.setState({ pokemon, isLoadingSingle: false });
    }

    /**
     * get non-hidden abilities
     * @param array abilities
     */
    getAbilities(abilities) {
        /** filter out hidden abilities */
        const filteredAbilities = abilities.filter(ability => !ability.is_hidden);
        /** extract a list of ability names */
        const keys = _.pluck(_.pluck(filteredAbilities, 'ability'), 'name');
        keys.forEach(key => {
            this.setState({ isLoadingAbilities: true }, this.getAbilityDesc(key));
        });
        /** TODO: fix */
        // this.setState({ isLoadingAbilities: false });
    }

    /**
     * get stats
     * @param array stats
     */
    getStats(stats) {
        /** extract a list of stat names */
        const keys = _.pluck(_.pluck(stats, 'stat'), 'name');
        /** extract a list of base stats */
        const values = _.pluck(stats, 'base_stat');
        const statsObj = _.object(keys, values);
        return statsObj;
    }

    /**
     * get types
     * @param array types
     */
    getTypes(types) {
        /** extract a list of type names */
        const filteredTypes = _.pluck(_.pluck(types, 'type'), 'name');
        return filteredTypes;
    }

    /**
     * get forms by url
     * @param url
     */
    getForms(url) {
        axios.get(url)
            .then(response => {
                /** extract a list of form names */
                const varieties = _.pluck(_.pluck(response.data.varieties, "pokemon"), "name");
                const pokemon = { ...this.state.pokemon };
                pokemon.forms = varieties;
                this.setState({ pokemon, isLoadingForms: false });
            })
            .catch(error => {
                console.log(error);
            });
    }

    getEvolutions(url) {
        axios.get(url)
            .then( response => {
                axios.get(response.data.evolution_chain.url)
                    .then(response => {
                        const chain = response.data.chain;
                        /** if there are evolutions */
                        if (chain.evolves_to.length > 0) {
                            /** initialize evolutions array w/ base pokemon */
                            const evolutions = [chain.species.name];
                            /** initialize stack w/ evolves_to objects */
                            let stack = [...chain.evolves_to];
                            /** while STACK is not empty */
                            while (stack.length > 0) {
                                /** if stack[0] has evolutions */
                                if (stack[0].evolves_to.length > 0) {
                                    /** push evolves_to objects to STACK */
                                    stack = [...stack, ...stack[0].evolves_to];
                                }
                                /** add evolution */
                                evolutions.push(stack[0].species.name);
                                /** pop STACK */
                                stack.shift();
                            }

                            const pokemon = {...this.state.pokemon};
                            pokemon.evolutions = evolutions;
                            this.setState({ pokemon, isLoadingEvolutions: false });
                        }
                    })
                    .catch(error => {
                       console.log(error);
                    });
            })
            .catch(error => {
                console.log(error);
            });
    }

    handleSearchChange(event, data) {
        const value = data.value;
        /** start search */
        this.setState({ searchQuery: value });
        /** clean query */
        if (value.length === 0) {
            this.setState({ searchResults: [], searchQuery: '' });
        }
        /** finish search */
        else {
            const filteredResults = ( this.state.pokemonList.filter(name => name.includes(value.toLowerCase())) ).map(elem => ({
                childKey: elem,
                id: elem,
                title: elem,
            }) );
            this.setState({ searchResults: filteredResults });
        }
    }

    handleSearchSelect(event, data) {
        this.setState({ searchQuery: data.result.title });
        this.setState({ isLoadingSingle: true }, () => this.getPokemon(this.state.searchQuery));
    }

    handleDropdown(event, data) {
        if (data.value !== this.state.pokemon.name) {
            this.setState({ isLoadingSingle: true }, () => this.getPokemon(data.value));
        }
    }

    /**
     * render the pokedex
     * @returns {JSX.Element}
     */
    render() {
        const pokemon = this.state.pokemon;
        const IS_LOADING = this.state.isLoadingSingle || this.state.isLoadingList || this.state.isLoadingAbilities ||
                           this.state.isLoadingForms || this.state.isLoadingEvolutions;

        return (
            <Container id='pokedex'>
                {
                    IS_LOADING ?
                        <Loader
                            active={IS_LOADING}
                            inline='centered'
                            content='Catching Pokemon...'
                        />
                        :
                        <div>
                            <Search
                                loading={false}
                                onResultSelect={(event, data) => this.handleSearchSelect(event, data)}
                                onSearchChange={(event, data) => this.handleSearchChange(event, data)}
                                results={this.state.searchResults}
                                value={this.state.searchQuery}
                                placeholder='Search for Pokemon...'
                                noResultsMessage='No Pokemon found.'
                            />
                            <Dropdown
                                placeholder='Select a form...'
                                selection
                                options={pokemon.forms.map(form => ({
                                   key: form,
                                   text: form,
                                   value: form
                                }) )}
                                onChange={(event, data) => this.handleDropdown(event, data)}
                            />
                            <Header as='h1'>Name: {pokemon.name}</Header>
                            <Image src={pokemon.sprite}/>
                            <p>Height: {pokemon.height}</p>
                            <p>Weight: {pokemon.weight}</p>
                            Types:
                            <ul>
                                {
                                    pokemon.types.map(type => <li key={type}>{type}</li>)
                                }
                            </ul>
                            Abilities:
                            <ul>
                                {
                                    Object.keys(pokemon.abilities).map(ability => {
                                        return <li key={ability}>{ability}: {pokemon.abilities[ability]}</li>
                                    })
                                }
                            </ul>
                            Stats:
                            <ul>
                                {
                                    Object.keys(pokemon.stats).map(stat => {
                                        return <li key={stat}>{stat}: {pokemon.stats[stat]}</li>
                                    })
                                }
                            </ul>
                        </div>
                }
            </Container>
        );
    }
}

ReactDOM.render(
    <Pokedex/>,
    document.querySelector('#root')
);
