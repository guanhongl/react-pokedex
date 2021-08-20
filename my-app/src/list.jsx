import React from 'react';
import { withRouter } from 'react-router-dom';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import colors from './variables.json'
import { Image, Container, Loader, Card, Grid, Input, Dropdown, Button, Header } from 'semantic-ui-react';
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
            maxCards: 150,
            // isLoadingMore: true,
            entries: [],
            sort: ''
        };
        this.handleOverflow = this.handleOverflow.bind(this);
        this.handleScroll = this.handleScroll.bind(this);

        const resizer = new ResizeObserver(this.handleOverflow);
        this.attachResizer = element => {
            if (element) {
                resizer.observe(element);
            }
        };
        this.clearResizer = () => resizer.disconnect();

        const observer = new IntersectionObserver(this.handleScroll, {
            root: null,
            rootMargin: '0px',
            threshold: 1,
        });
        this.attachObserver = element => {
            if (element) {
                observer.observe(element);
            }
        };

        this.clearObservers = () => {
            resizer.disconnect();
            observer.disconnect();
        };
    }

    componentDidMount() {
        this.getPokemonList();
    }

    componentDidUpdate(prevProps, prevState) {
        // if (this.state.isLoadingMore) {
        //     setTimeout(
        //         () => this.setState({ maxCards: this.state.maxCards + 150, isLoadingMore: false })
        //     , 0);
        // }
        if (this.state.entries.length > prevState.entries.length) {
            this.handleOverflow(this.state.entries);
        }
        /** if dropdown or search query changes */
        if (this.state.sort !== prevState.sort || this.state.filteredData.length !== prevState.filteredData.length) {
            this.handleSort();
        }
    }

    componentWillUnmount() {
        this.clearObservers();
    }

    handleOverflow(entries) {
        if (this.state.entries.length !== this.state.maxCards && this.state.entries.length !== this.state.filteredData.length) {
            const OLD = [...this.state.entries]; // need to deep clone?
            const OLD_IDS = _.pluck(_.pluck(OLD, 'target'), 'id');
            const NEW_IDS = _.pluck(_.pluck(entries, 'target'), 'id');
            NEW_IDS.forEach((id, index) => {
                if (!OLD_IDS.includes(id)) {
                    OLD.push(entries[index]);
                }
            });
            this.setState({ entries: OLD });
        }

        /** maxWidth is static */
        const maxWidth = 230;
        const width = entries[0].contentRect.width; // width of card
        const filteredData = JSON.parse(JSON.stringify(this.state.filteredData));
        if (entries.length === filteredData.length || entries.length === this.state.maxCards) {
            console.log(entries.length)
            entries.forEach((entry, index) => {
                const id = entry.target.id;
                /** if name can be shortened and more than 10 chars. */
                if (this.state.pokemonList[id - 1].includes('-') && this.state.pokemonList[id - 1].length > 10) {
                    try {
                        /** reset name */
                        filteredData[index].name = this.state.pokemonList[id - 1];

                        /** if maxWidth > width, shorten name */
                        if (maxWidth > width) {
                            filteredData[index].name = filteredData[index].name.split('-')[0];
                        }

                        console.log('resize')
                    }
                    catch (error) {
                        console.log(error)
                    }
                }
            });
        }
        this.setState({ filteredData });
    }

    handleScroll(entries) {
        if (entries[0].isIntersecting) {
            // console.log('load more')
            this.setState({ maxCards: this.state.maxCards + 150 });
        }
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
                                this.setState({ pokemonData, isLoadingData: false }, this.filterData.bind(this));
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

    filterData() {
        /** parse, stringify used to deep clone array */
        const filteredData = this.state.pokemonData.filter(pokemon =>
            /** TODO: if filter by maxlength = id, add id condition */
            pokemon.name.includes(this.state.searchQuery.toLowerCase().replaceAll(' ', '-'))
        );
        this.setState({ filteredData });
        setTimeout(() => this.setState({ cardLoader: false }), 0);
    }

    handleSearch(event, data) {
        this.setState({ cardLoader: true, maxCards: 150, entries: [] }, () => this.clearResizer());
        this.setState({ searchQuery: data.value }, this.filterData.bind(this));
    }

    handleSort() {
        const filteredData = this.state.filteredData;
        if (filteredData.length > 1) {
            /** if in order */
            if (filteredData[filteredData.length - 1].id > filteredData[0].id ) {
                if (this.state.sort === 'descend') {
                    this.reverseData();
                }
            }
            /** if not in order */
            else {
                if (this.state.sort === 'ascend') {
                    this.reverseData();
                }
            }
        }
    }

    reverseData() {
        this.setState({ cardLoader: true, maxCards: 150, entries: [] }, () => this.clearResizer());
        this.setState({ filteredData: this.state.filteredData.reverse() });
        setTimeout(() => this.setState({ cardLoader: false }), 0);
    }

    handleDropdown(event, data) {
        // const filteredData = this.state.filteredData;
        // if (filteredData.length > 1) {
        //     /** if in order */
        //     if (filteredData[filteredData.length - 1].id > filteredData[0].id ) {
        //         if (data.value === 'descend') {
        //             this.reverseData();
        //         }
        //     }
        //     /** if not in order */
        //     else {
        //         if (data.value === 'ascend') {
        //             this.reverseData();
        //         }
        //     }
        // }
        this.setState({ sort: data.value });
    }

    getPokemon(id) {
        // const path = `/search/pokemon/${name}`;
        // this.props.history.push(path);
        const name = this.state.pokemonList[id - 1];
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

    // handleSeeMore() {
    //     this.setState({ isLoadingMore: true });
    // }

    displaySeeMore() {
        const { filteredData, cardLoader, maxCards, pokemonList } = this.state;

        return filteredData.length > maxCards && // if more cards to display
            !cardLoader && // if cards not loading
            maxCards < pokemonList.length; // if not all pokemon displayed
    }

    noHyphen(name) {
        return name.includes('-') ? name.replaceAll('-', ' ') : name;
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
                                            { key: 'ascend', text: 'ascending', value: 'ascend' },
                                            { key: 'descend', text: 'descending', value: 'descend' }
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
                                if (index < this.state.maxCards) {
                                    return (
                                        <a
                                            class='ui card'
                                            ref={this.attachResizer}
                                            id={pokemon.id}
                                            key={pokemon.id}
                                            style={{
                                                background: pokemon.types.length > 1 ?
                                                    this.getGradient(pokemon.types[0], pokemon.types[1])
                                                    :
                                                    this.getColor(pokemon.types[0])
                                            }}
                                            onClick={() => this.getPokemon(pokemon.id)}
                                        >
                                            <Card.Content textAlign={'center'}>
                                                <Image src={pokemon.sprite}/>
                                                <div className='card-header'>
                                                    {this.noHyphen(pokemon.name)}
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
                                        </a>
                                    );
                                }
                            })
                        }
                    </Card.Group>
                }
                {
                    this.displaySeeMore() &&
                    <div ref={this.attachObserver} class="ui active centered inline loader" id='see-more'></div>
                }
                {/*<Button onClick={this.handleSeeMore.bind(this)}>See more</Button>*/}
                {
                    this.state.filteredData.length === 0 &&
                    <Header as='h3' textAlign='center' id='no-results-header'>No results found.</Header>
                }
            </Container>
        );
    }
}

export default withRouter(List);
