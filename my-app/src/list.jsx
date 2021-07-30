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
            isLoadingData: true,
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
                        const promises = pokemonList.map((name) =>
                            axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
                        );
                        Promise.all(promises)
                            .then(responses => {
                                const pokemonData = responses.map(response => ({
                                    id: response.data.id,
                                    name: response.data.name,
                                    sprite: response.data.sprites.front_default,
                                    types: _.pluck(_.pluck(response.data.types, 'type'), 'name')
                                }));
                                this.setState({ pokemonData, isLoadingData: false });
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        if (this.state.pokemonList.length === 0 || this.state.isLoadingData) {
            return <Loader active inline='centered'>Getting List...</Loader>
        }
        return(
            <Container>

            </Container>
        );
    }
}

export default List;
