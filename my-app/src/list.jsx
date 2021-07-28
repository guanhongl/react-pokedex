import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Image, Container, Loader, Card } from 'semantic-ui-react';
import axios from 'axios';
import * as _ from 'underscore';

/**
 * the top menu component
 */
class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pokemonList: [],
            pokemonData: [],
        };
    }

    componentDidMount() {
        this.getPokemonList();
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
                        this.setState({ pokemonList });
                        const pokemonData = [];
                        for (let i = 0; i < limit; i++) {
                            pokemonData.push({});
                        }
                        this.setState({ pokemonData }, () =>
                            pokemonList.forEach((pokemon, index) => this.getPokemonData(pokemon, index))
                        );
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
            .catch(error => {
                console.log(error);
            });
    }

    getPokemonData(name, index) {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
            .then(response => {
                const data = response.data;
                const pokemon = {
                    id: data.id,
                    name: data.name,
                    sprite: data.sprites.front_default,
                    types: _.pluck(_.pluck(data.types, 'type'), 'name')
                };
                const pokemonData = this.state.pokemonData;
                pokemonData[index] = pokemon;
                this.setState({ pokemonData });
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        if (this.state.pokemonList.length === 0) {
            return <Loader active inline='centered'>Getting List...</Loader>
        }
        return(
            <Container>

            </Container>
        );
    }
}

export default List;
