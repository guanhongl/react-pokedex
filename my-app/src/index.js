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
                abilities: [],
                height: NaN,
                name: '',
                sprite: '',
                stats: {},
                types: [],
                weight: NaN,
            },
        };
        this.getPokemon = this.getPokemon.bind(this);
        this.setPokemon = this.setPokemon.bind(this);
        this.getAbilityDesc = this.getAbilityDesc.bind(this);
        this.getAbilities = this.getAbilities.bind(this);
    }

    /**
     * fires on component mount
     */
    componentDidMount() {
        this.getPokemon();
        //this.getAbilityDesc('blaze');
    }

    /**
     * get Pokemon data
     */
    getPokemon() {
        axios.get('https://pokeapi.co/api/v2/pokemon/charizard')
            .then(response => {
                this.setPokemon(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    /**
     * get ability description
     * @param ability string
     */
    getAbilityDesc(ability) {
        axios.get(`https://pokeapi.co/api/v2/ability/${ability}`)
            .then(response => {
                console.log(response.data.effect_entries[1].effect);
                return response.data.effect_entries[1].effect;
            })
            .catch(error => {
                console.log(error);
            });
    }

    /**
     * set Pokemon state
     * @param data array
     */
    setPokemon(data) {
        const pokemon = {};
        pokemon.abilities = this.getAbilities(data.abilities);
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
     * @param abilities array
     */
    getAbilities(abilities) {
        const filteredAbilities = abilities.filter(ability => !ability.is_hidden);
        const keys = _.pluck(_.pluck(filteredAbilities, 'ability'), 'name');
        console.log(keys);
        const values = keys.map(ability =>
            this.getAbilityDesc(ability)
        );
        console.log(values);
        return keys;
    }

    /**
     * get stats
     * @param stats array
     */
    getStats(stats) {
        const keys = _.pluck(_.pluck(stats, 'stat'), 'name');
        const values = _.pluck(stats, 'base_stat');
        const statsObj = _.object(keys, values);
        return statsObj;
    }

    /**
     * get types
     * @param types array
     */
    getTypes(types) {
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
