import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Segment, Grid, Divider, Header, Icon, Search, Button, Container } from 'semantic-ui-react';
import axios from 'axios';
import * as _ from 'underscore';

/**
 * the home page component
 */
class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pokemonList: [],
            searchQuery: '',
            searchResults: [],

        };
    }

    /**
     * fires on component mount
     */
    componentDidMount() {
        {/** TODO: move task to parent component */}
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
            const filteredResults = (
                this.state.pokemonList.filter(name => name.includes(value.toLowerCase().replaceAll(' ', '-')))
            ).map(elem => ({
                childKey: elem,
                id: elem,
                title: this.noHyphen(elem)
            }) );
            this.setState({ searchResults: filteredResults });
        }
    }

    handleSearchSelect(event, data) {
        this.setState({ searchQuery: data.result.id });
        // const path = `/search/pokemon/${data.result.id}`;
        // this.props.history.push(path);
        window.location.hash = `#/search/pokemon/${data.result.id}`; // will refresh page
    }

    noHyphen(name) {
        return name.includes('-') ? name.replaceAll('-', ' ') : name;
    }

    render() {
        return (
            <Container id='home'>
                <Segment placeholder>
                    <Grid columns={2} stackable textAlign='center'>
                        <Divider vertical>Or</Divider>

                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column className='col-one'>
                                <Header icon>
                                    <Icon name='search' />
                                    Find Pokemon
                                </Header>

                                <Search
                                    onResultSelect={(event, data) => this.handleSearchSelect(event, data)}
                                    onSearchChange={(event, data) => this.handleSearchChange(event, data)}
                                    results={this.state.searchResults}
                                    value={this.noHyphen(this.state.searchQuery)}
                                    placeholder='Search Pokemon...'
                                    noResultsMessage='No Pokemon found.'
                                />
                            </Grid.Column>

                            <Grid.Column>
                                <Header icon>
                                    <Icon name='world' />
                                    View all Pokemon
                                </Header>
                                <Button color='red' onClick={() => window.location.hash='#/list'}>View</Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </Container>
        )
    }
}

export default Home;
