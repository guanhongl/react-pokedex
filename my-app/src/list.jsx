import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import colors from './variables.json'
import { Image, Container, Loader, Card, Grid, Search, Dropdown } from 'semantic-ui-react';
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

    getGradient(type1, type2) {
        const color1 = colors.find(color => color.name.includes(type1)).value;
        const color2 = colors.find(color => color.name.includes(type2)).value;

        return `linear-gradient(to right, ${color1} 50%, ${color2} 50%)`;
    }

    getColor(type) {
        return colors.find(color => color.name.includes(type)).value;
    }

    render() {
        if (this.state.pokemonList.length === 0 || this.state.isLoadingData) {
            return <Loader id='list-loader' active inline='centered'>Getting List...</Loader>
        }
        return(
            <Container id='list-container'>
                <Grid stackable>
                    <Grid.Row columns={3}>
                        <Grid.Column></Grid.Column>
                        <Grid.Column>
                            <Search
                                fluid
                                input={{fluid: true}}
                                loading={false}
                                // onResultSelect={(event, data) => this.handleSearchSelect(event, data)}
                                // onSearchChange={(event, data) => this.handleSearchChange(event, data)}
                                // results={this.state.searchResults}
                                // value={this.state.searchQuery}
                                placeholder='Search for Pokemon...'
                                noResultsMessage='No Pokemon found.'
                            />
                        </Grid.Column>
                        <Grid.Column textAlign={'right'}>
                            {
                                <Dropdown
                                    placeholder='Sort by...'
                                    selection
                                    // options={pokemon.forms.map(form => ({
                                    //     key: form,
                                    //     text: form,
                                    //     value: form
                                    // }))}
                                    // onChange={(event, data) => this.handleDropdown(event, data)}
                                />
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Card.Group itemsPerRow={6} doubling={true}>
                    {
                        this.state.pokemonData.map((pokemon, index) => {
                            if (index < 151) {
                                return (
                                    <Card
                                        key={pokemon.id}
                                        style={{
                                            background: pokemon.types.length > 1 ?
                                                this.getGradient(pokemon.types[0], pokemon.types[1])
                                                :
                                                this.getColor(pokemon.types[0])
                                        }}
                                    >
                                        <Card.Content textAlign={'center'}>
                                            <Image src={pokemon.sprite} />
                                            <div className='card-header'>
                                                {pokemon.name}
                                                <span>
                                                    #{pokemon.id.toString().padStart(3, '0')}
                                                </span>
                                            </div>
                                        </Card.Content>
                                    </Card>
                                );
                            }
                        })
                    }
                </Card.Group>
            </Container>
        );
    }
}

export default List;
