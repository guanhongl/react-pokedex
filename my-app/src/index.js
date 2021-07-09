import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Container, Header, Image } from 'semantic-ui-react';
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
                abilities: {},
                /** height in decimetres */
                height: NaN,
                name: '',
                sprite: '',
                stats: {},
                types: [],
                /** weight in hectograms */
                weight: NaN,
            },
            pokemonList: [],
        };
        this.getPokemon = this.getPokemon.bind(this);
        this.setPokemon = this.setPokemon.bind(this);
        this.getAbilityDesc = this.getAbilityDesc.bind(this);
        this.getAbilities = this.getAbilities.bind(this);
        this.getPokemonList = this.getPokemonList.bind(this);
    }

    /**
     * fires on component mount
     */
    componentDidMount() {
        this.getPokemon(6, false);
        this.getPokemonList();
        //this.getAbilityDesc('blaze');
    }

    /**
     * get Pokemon data
     * @param pokemon name
     * @param boolean isGettingList
     */
    getPokemon(name, isGettingList) {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
            .then(response => {
                if (isGettingList) {
                    //console.log(response);
                    this.setState({
                        pokemonList: [...this.state.pokemonList, response.data.name]
                    });
                }
                else {
                    this.setPokemon(response.data);
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    /**
     * populate pokemon list w/ names
     */
    getPokemonList() {
        /** TODO */
        for (let i = 1; i <= 100; i++) {
            this.getPokemon(i, true);
        }
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
                abilities[ability] = response.data.effect_entries[1].effect;
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
        pokemon.abilities = {};
        pokemon.height = data.height;
        pokemon.name = data.name;
        pokemon.sprite = data.sprites.front_default;
        pokemon.stats = this.getStats(data.stats);
        pokemon.types = this.getTypes(data.types);
        pokemon.weight = data.weight;
        this.setState({ pokemon });
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
     * render the pokedex
     * @returns {JSX.Element}
     */
    render() {
        const pokemon = this.state.pokemon;

        return (
            <Container>
                <Header as='h1'>{pokemon.name}</Header>
                <Image src={pokemon.sprite}/>
            </Container>
        );
    }
}

ReactDOM.render(
    <Pokedex/>,
    document.querySelector('#root')
);
