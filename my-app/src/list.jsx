import React from 'react';
import { withRouter } from 'react-router-dom';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import colors from './variables.json'
import { Image, Container, Loader, Card, Grid, Input, Dropdown, Button } from 'semantic-ui-react';
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
            filteredData: [],
            searchQuery: '',
            cardLoader: false,
        };
    }

    componentDidMount() {
        this.getPokemonList();
    }

    componentDidUpdate(prevProps, prevState) {
        /** if first render, or if filtered AND if cards are rendered */
        if ((prevState.isLoadingData || prevState.cardLoader && !this.state.cardLoader) &&
            document.querySelectorAll('.card-header').length > 0) {
            this.handleOverflow();
        }
    }

    /** DOM manipulation */
    handleOverflow() {
        const filteredData = this.state.filteredData;
        const elements = document.querySelectorAll('.card-header');
        elements.forEach((element, index) => {
            if (element.scrollWidth > element.clientWidth && filteredData[index].name.includes('-')) {
                filteredData[index].name = filteredData[index].name.slice(0, filteredData[index].name.indexOf('-'));
            }
        });
        this.setState({ filteredData });
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
                                this.setState({ pokemonData, filteredData: pokemonData, isLoadingData: false });
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

    handleSearch(event, data) {
        this.setState({ cardLoader: true });
        // this.setState({ searchQuery: data.value });
        _.debounce(this.setState({ searchQuery: data.value }), 500);
        /** parse, stringify used to deep clone array */
        const filteredData = JSON.parse(JSON.stringify(this.state.pokemonData)).filter(pokemon =>
            pokemon.name.includes(data.value.toLowerCase())
        );
        this.setState({ filteredData });
        setTimeout(() => this.setState({ cardLoader: false }), 0);
        // _.debounce(this.setState({ filteredData }), 500);
    }

    handleDropdown(event, data) {
        {/** TODO: better logic? */}
        const filteredData = this.state.filteredData;
        if (filteredData.length > 0) {
            if (data.value === 'descend' && filteredData[0].id < filteredData[filteredData.length -1].id) {
                this.setState({ cardLoader: true })
                this.setState({ filteredData: filteredData.reverse() });
                setTimeout(() => this.setState({ cardLoader: false }), 0);
            }
            else if (filteredData[0].id > filteredData[filteredData.length -1].id) {
                this.setState({ cardLoader: true })
                this.setState({ filteredData: filteredData.reverse() });
                setTimeout(() => this.setState({ cardLoader: false }), 0);
            }
        }

    }

    getPokemon(name) {
        // const path = `/search/pokemon/${name}`;
        // this.props.history.push(path);
        window.open(`/search/pokemon/${name}`, '_blank').focus();
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
                            <Input
                                icon='search'
                                placeholder='Search...'
                                fluid
                                onChange={this.handleSearch.bind(this)}
                                value={this.state.searchQuery}
                                loading={this.state.cardLoader}
                            />
                        </Grid.Column>
                        <Grid.Column textAlign={'right'}>
                            {
                                <Dropdown
                                    placeholder='Sort by number...'
                                    selection
                                    options={
                                        [
                                            {
                                                key: 0,
                                                text: '',
                                                value: ''
                                            },
                                            {
                                                key: 'ascend',
                                                text: 'ascending',
                                                value: 'ascend'
                                            },
                                            {
                                                key: 'descend',
                                                text: 'descending',
                                                value: 'descend'
                                            }
                                        ]
                                    }
                                    onChange={this.handleDropdown.bind(this)}
                                />
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                {
                    this.state.cardLoader ?
                        <Loader id='card-loader' active={this.state.cardLoader} inline='centered' />
                        :
                    <Card.Group itemsPerRow={6} doubling={true}>
                        {
                            this.state.filteredData.map((pokemon, index) => {
                                if (index < 900) {
                                    return (
                                        <Card
                                            key={pokemon.id}
                                            style={{
                                                background: pokemon.types.length > 1 ?
                                                    this.getGradient(pokemon.types[0], pokemon.types[1])
                                                    :
                                                    this.getColor(pokemon.types[0])
                                            }}
                                            onClick={() => this.getPokemon(pokemon.name)}
                                        >
                                            <Card.Content textAlign={'center'}>
                                                <Image src={pokemon.sprite}/>
                                                <div className='card-header'>
                                                    {pokemon.name}
                                                    <span>
                                                        #{pokemon.id.toString().padStart(3, '0')}
                                                    </span>
                                                </div>
                                                <Button.Group>
                                                    {
                                                        pokemon.types.map(type =>
                                                            <Button
                                                                size={'mini'}
                                                                className={`type-button`}
                                                                key={_.uniqueId('TYPE_')}
                                                            >
                                                                {type.toUpperCase()}
                                                            </Button>
                                                        )
                                                    }
                                                </Button.Group>
                                            </Card.Content>
                                        </Card>
                                    );
                                }
                            })
                        }
                    </Card.Group>
                }
            </Container>
        );
    }
}

export default withRouter(List);
