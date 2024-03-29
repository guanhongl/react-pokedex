import React from 'react';
import { withRouter } from 'react-router-dom';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Button, Container, Dropdown, Grid, Header, Image, Label, Loader, Search, Checkbox, Icon } from 'semantic-ui-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import * as _ from 'underscore';
import Evolutions from './evolutions';
import AbilityDesc from './abilitydesc';
import FlavorText from './flavortext';

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
                height: NaN,
                name: '',
                sprites: [],
                stats: {},
                types: [],
                weight: NaN,
                forms: [],
                evolutions: [],
                evolutionList: [],
                /** TODO: pokemon info. (pokemon-species/{id or name} -> flavor_text_entries) */
            },
            pokemonList: [],
            isLoadingSingle: true,
            isLoadingList: true,
            searchResults: [],
            searchQuery: '',
            /** see more toggle data */
            toggled: false,
            maxChains: 1,
            /** ability modal data */
            active: false,
            ability: '',
            desc: '',
            /** flip image */
            flipImage: false,
            /** info modal */
            infoActive: false
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
        this.handleAbilityClick = this.handleAbilityClick.bind(this);
        this.handleAbilityClose = this.handleAbilityClose.bind(this);
        this.handleInfoClose = this.handleInfoClose.bind(this);
    }

    /**
     * fires on component mount
     */
    componentDidMount() {
        this.getPokemon(this.props.match.params.name);
        {/** TODO: move task to parent component */}
        this.getPokemonList();
    }

    /**
     * fires on state change
     * @param prevProps
     * @param prevState
     */
    componentDidUpdate(prevProps, prevState) {
        if (!this.state.isLoadingSingle && this.props.match.params.name !== this.state.pokemon.name) {
            this.setState({ isLoadingSingle: true }, () => this.getPokemon(this.props.match.params.name));
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
                /** TODO: error popup */
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
                    response.data.effect_entries[1] && response.data.effect_entries[1].language.name === "en"
                        ? abilities[ability] = response.data.effect_entries[1].effect
                        : abilities[ability] = response.data.effect_entries[0].effect;
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
        this.getForms(data.species.url);
        this.getEvolutions(data.species.url);

        pokemon.id = data.id;
        pokemon.abilities = {};
        pokemon.height = data.height;
        pokemon.name = data.name;
        pokemon.sprites = [data.sprites.front_default, data.sprites.back_default];
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
                this.setState({ pokemon });
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
                            const list = [chain.species.url.split('/')[6]];
                            /** initialize STACK w/ stage 1 evolution objects */
                            let stack = [...chain.evolves_to];
                            /**
                             * for each stage 1 evolution, initialize evolutions w/ an array of stage 0 & 1 evolutions
                             * e.g. [ [stage-0, stage-1], ... ]
                             */
                            const evolutions = chain.evolves_to.map(evolution =>
                                [ {[chain.species.name] : chain.species.url.split('/')[6]},
                                  {[evolution.species.name] : evolution.species.url.split('/')[6]} ]
                            );
                            // console.log(chain.species.url.split('/')[6])
                            /** the array index */
                            let arrayIndex = 0;
                            /** while STACK is not empty */
                            while (stack.length > 0) {
                                /** if TOP has evolutions (stage 2) */
                                if (stack[0].evolves_to.length > 0) {
                                    const top = stack.shift();
                                    /** push stage 2 evolution(s) at index 1; DFS handle chain first */
                                    stack = [top, ...top.evolves_to, ...stack];
                                    /** if TOP has 1+ stage 2 evolutions */
                                    if (stack[0].evolves_to.length > 1) {
                                        /** deep copy evolutions array */
                                        const copy = JSON.parse(JSON.stringify(evolutions));
                                        /** push copy */
                                        evolutions.push(...copy);
                                    }
                                    /** push each stage 2 evolution to their respective chain */
                                    stack[0].evolves_to.forEach((evolution, index) =>
                                        evolutions[index + arrayIndex].push(
                                            {[evolution.species.name]: evolution.species.url.split('/')[6]}
                                        )
                                    );
                                    arrayIndex++;
                                }
                                list.push(stack[0].species.url.split('/')[6]);
                                stack.shift();
                            }

                            const pokemon = {...this.state.pokemon};
                            pokemon.evolutions = evolutions;
                            pokemon.evolutionList = list;
                            this.setState({ pokemon });
                            if (this.state.toggled) {
                                this.setState({ maxChains: evolutions.length });
                            }
                        }
                        else {
                            /** push dummy data */
                            const pokemon = {...this.state.pokemon};
                            pokemon.evolutions = ['none'];
                            pokemon.evolutionList = ['none'];
                            this.setState({ pokemon });
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
        // this.setState({ isLoadingSingle: true }, () => this.getPokemon(this.state.searchQuery));
        const path = `/search/pokemon/${data.result.id}`;
        this.props.history.push(path);
    }

    handleDropdown(event, data) {
        if (data.value !== this.state.pokemon.name) {
            // this.setState({ isLoadingSingle: true }, () => this.getPokemon(data.value));
            const path = `/search/pokemon/${data.value}`;
            this.props.history.push(path);
        }
    }

    handleToggle(event, data) {
        // console.log(this.state.pokemon.evolutions.length)
        data.checked ?
            this.setState({ maxChains: this.state.pokemon.evolutions.length })
            :
            this.setState({ maxChains: 1 })
        this.setState({ toggled: data.checked });
    }

    handleAbilityClick(ability, desc) {
        this.setState({ active: true, ability, desc });
    }

    handleAbilityClose() {
        this.setState({ active: false });
    }

    handleInfoClose() {
        this.setState({ infoActive: false });
    }

    noHyphen(name) {
        return name.includes('-') ? name.replaceAll('-', ' ') : name;
    }

    /** https://www.schemecolor.com/red-orange-green-gradient.php */
    fillBar(value) {
        if (value < 50) {
            return '#FF0D0D';
        }
        if (value < 100) {
            return '#FF8E15';
        }
        if (value < 150) {
            return '#FAB733';
        }
        else {
            return '#69B34C';
        }
    }

    /**
     * render the pokedex
     * @returns {JSX.Element}
     */
    render() {
        const pokemon = this.state.pokemon;
        const displayID = pokemon.id <= this.state.pokemonList.length
            ? pokemon.id
            : this.state.pokemonList.findIndex(e => e === pokemon.forms[0]) + 1;
        const displayName = this.noHyphen(pokemon.name);
        const graphData = Object.keys(pokemon.stats).map(stat => ({
            name: `${stat} (${pokemon.stats[stat]})`,
            value: pokemon.stats[stat]
        }));

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
                        <Grid stackable>
                            <Grid.Row columns={3}>
                                <Grid.Column></Grid.Column>
                                <Grid.Column>
                                    <Search
                                        fluid
                                        input={{fluid: true}}
                                        loading={false}
                                        onResultSelect={(event, data) => this.handleSearchSelect(event, data)}
                                        onSearchChange={(event, data) => this.handleSearchChange(event, data)}
                                        results={this.state.searchResults}
                                        value={this.noHyphen(this.state.searchQuery)}
                                        placeholder='Search for Pokemon...'
                                        noResultsMessage='No Pokemon found.'
                                    />
                                </Grid.Column>
                                <Grid.Column textAlign={'right'}>
                                    {
                                        pokemon.forms.length > 1 &&
                                        <Dropdown
                                            placeholder='Select a form...'
                                            selection
                                            options={pokemon.forms.map(form => ({
                                                key: form,
                                                text: this.noHyphen(form),
                                                value: form
                                            }))}
                                            onChange={(event, data) => this.handleDropdown(event, data)}
                                        />
                                    }
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={2}>
                                <Grid.Column>
                                    <div className='card'>
                                        <Icon name='info circle' size='large' className='info-icon'
                                              onClick={() => this.setState({ infoActive: true })} />
                                        {/** sprites */}
                                        <div className='sprite-div'>
                                            <Image src={this.state.flipImage && pokemon.sprites[1] ?
                                                        pokemon.sprites[1] : pokemon.sprites[0]} centered size='small' />
                                            <Icon
                                                name='sync alternate'
                                                onClick={() => this.setState({ flipImage: !this.state.flipImage })}
                                            />
                                        </div>
                                        {/** name + id */}
                                        <Header as='h2' className='card-header'>
                                            {displayName} #{displayID}
                                            <Header.Subheader>
                                                {pokemon.height/10}m | {pokemon.weight !== 10000 ? pokemon.weight/10 : '???'}kg
                                            </Header.Subheader>
                                        </Header>
                                        {/** type */}
                                        <div>
                                            {
                                                pokemon.types.map(type => {
                                                    return (<Button
                                                                size={'mini'}
                                                                className={`type-button ${type}`}
                                                                key={type}
                                                            >
                                                                {type.toUpperCase()}
                                                            </Button>);
                                                })
                                            }
                                        </div>
                                        {/** ability */}
                                        <div>
                                            {
                                                Object.keys(pokemon.abilities).map(ability => {
                                                    return (
                                                        <Button
                                                            size={'mini'}
                                                            className='ability-button'
                                                            key={ability}
                                                            onClick={() => this.handleAbilityClick(ability, pokemon.abilities[ability])}
                                                        >
                                                            {this.noHyphen(ability.toUpperCase())}
                                                            <Icon name='info circle' className='top-right-icon' />
                                                        </Button>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                </Grid.Column>
                                <Grid.Column>
                                    {/** stats */}
                                    <ResponsiveContainer width="100%" height={293}>
                                        <BarChart
                                            className='bar-chart'
                                            data={graphData}
                                            layout='vertical'
                                            barSize={15}
                                        >
                                            <XAxis hide type='number' />
                                            <YAxis
                                                dataKey='name'
                                                type='category'
                                                axisLine={false}
                                                tickLine={false}
                                                width={150}
                                                padding={{top: 30, bottom: 30}}
                                            />
                                            <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                                                {
                                                    graphData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={this.fillBar(entry.value)} />
                                                    ))
                                                }
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row centered id='evolutions-row' className={`${pokemon.types[0]}-border`}>
                                <Label attached='top' className={`evo-label ${pokemon.types[0]}`}>
                                    evolutions
                                    <span>
                                        <label>show all </label>
                                        <Checkbox toggle onClick={this.handleToggle.bind(this)} checked={this.state.toggled}/>
                                    </span>
                                </Label>
                                {
                                    (pokemon.evolutions.length !== 0 && pokemon.evolutionList.length !== 0) ?
                                        <Evolutions evolutions={pokemon.evolutions} list={pokemon.evolutionList}
                                                    getPokemon={this.getPokemon} currentId={pokemon.id}
                                                    maxChains={this.state.maxChains}/>
                                        :
                                        <Loader active inline='centered'>Getting Evolutions...</Loader>
                                }
                            </Grid.Row>
                        </Grid>
                }
                <AbilityDesc active={this.state.active} handleClose={this.handleAbilityClose}
                             ability={this.noHyphen(this.state.ability)} desc={this.state.desc} />
                {
                    pokemon.name && pokemon.id &&
                    <FlavorText active={this.state.infoActive} handleClose={this.handleInfoClose} name={pokemon.name}
                                id={pokemon.id}/>
                }
            </Container>
        );
    }
}

export default withRouter(Pokedex);
