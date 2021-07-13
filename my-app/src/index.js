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
                /** TODO: evolutions */
                /** TODO: pokemon info. (pokemon-species/{id or name} -> flavor_text_entries) */
            },
            pokemonList: [],
            isLoadingSingle: true,
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
        this.getPokemonList = this.getPokemonList.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearchSelect = this.handleSearchSelect.bind(this);
        this.handleDropdown = this.handleDropdown.bind(this);
    }

    /**
     * fires on component mount
     */
    componentDidMount() {
        this.getPokemon(291);
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
            this.setState({ prevPokemon: prevState.pokemon.id });
        }
    }

    /**
     * get Pokemon data
     * @param pokemon name
     * TODO: change to param id?
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
        axios.get('https://pokeapi.co/api/v2/pokemon-species')
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
                    })
            })
            .catch(error => {
                console.log(error);
            })
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
                this.setState({ pokemon });
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
        this.getAbilities(data.abilities);
        this.getForms(data.species.name, data.is_default);

        pokemon.id = data.id;
        pokemon.abilities = {};
        pokemon.height = data.height;
        pokemon.name = data.name;
        pokemon.sprite = data.sprites.front_default;
        pokemon.stats = this.getStats(data.stats);
        pokemon.types = this.getTypes(data.types);
        pokemon.weight = data.weight;
        pokemon.forms = [];
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
            this.getAbilityDesc(key);
        })
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
     * get forms by name
     * @param name
     */
    getForms(name, isDefault) {
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${name}`)
            .then(response => {
                /** extract a list of form names */
                const varieties = _.pluck(_.pluck(response.data.varieties, "pokemon"), "name");
                const pokemon = { ...this.state.pokemon };
                pokemon.forms = varieties;
                this.setState({ pokemon });
            })
            .catch(error => {
                console.log(error);
            })
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

        return (
            <Container id='pokedex'>
                {
                    this.state.isLoadingSingle || this.state.isLoadingList ?
                        <Loader
                            active={this.state.isLoadingSingle || this.state.isLoadingList}
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
