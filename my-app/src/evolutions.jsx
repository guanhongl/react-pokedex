import React from 'react';
import { withRouter } from 'react-router-dom';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { List, Grid, Image, Header, Button, Icon, Loader } from 'semantic-ui-react';
import axios from 'axios';
import * as _ from 'underscore';

class Evolutions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sprites: {},
            types: {},
        };
        this.getPokemon = this.getPokemon.bind(this);
        this.idToName = this.idToName.bind(this);
    }

    componentDidMount() {
        // console.log(this.props.evolutions)
        // console.log(this.props.list)
        if (this.props.list[0] !== 'none')
            this.props.list.forEach(id => {
               this.getPokemon(id)
            });
    }

    getPokemon(id) {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(response => {
                const sprites = {...this.state.sprites, [id] : response.data.sprites.front_default};
                const types = {...this.state.types, [id] : _.pluck(_.pluck(response.data.types, 'type'), 'name')};
                this.setState({ sprites, types });
            })
            .catch(error => {
                console.log(error);
            });
    }

    idToName(id) {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(response => {
                // this.props.getPokemon(id);
                const path = `/search/pokemon/${response.data.name}`;
                this.props.history.push(path);
            })
    }

    handleClick(id) {
        // console.log('id',id[0])
        // console.log('prop', this.props.currentId)
        // console.log(id[0] == this.props.currentId)
        if (id[0] !== this.props.currentId) {
            // this.props.getPokemon(id);
            this.idToName(id);
        }
    }

    noHyphen(name) {
        return name[0].includes('-') ? name[0].replaceAll('-', ' ') : name;
    }

    render() {
        const sprites = this.state.sprites;
        const types = this.state.types;
        if(this.props.list[0] === 'none') {
            return <Header as='h3' className='no-evo-header'>No evolutions</Header>
        }
        if(Object.keys(sprites).length + Object.keys(types).length !== 2 * this.props.list.length) {
            // console.log('load')
            return <Loader active inline='centered'>Getting Evolutions...</Loader>
        }
        // console.log('finish load', this.state.sprites)
        // console.log(this.state.types)
        return (
            <Grid id='evo-grid'>
                {
                    this.props.evolutions.map((chain, index) => {
                        if (index < this.props.maxChains) {
                            return (
                            <Grid.Row centered key={_.uniqueId('ROW_')}>
                                <List horizontal>
                                    {
                                        chain.map((pokemon, index) => {
                                            const listItem = [];
                                            listItem.push(
                                                <List.Item
                                                    key={_.uniqueId('KEY_')}
                                                    onClick={() => this.handleClick(Object.values(pokemon))}
                                                    className='evo-item'
                                                >
                                                    {/*{console.log(sprites[Object.values(pokemon)])}*/}
                                                    <Image src={sprites[Object.values(pokemon)]}/>
                                                    <div className='evolution-header'>{this.noHyphen(Object.keys(pokemon))}
                                                        <span> #{Object.values(pokemon)[0].padStart(3, '0')}</span>
                                                    </div>
                                                    <div>
                                                        {
                                                            types[Object.values(pokemon)].map(type =>
                                                                <Button
                                                                    size={'mini'}
                                                                    className={`type-button ${type}`}
                                                                    key={_.uniqueId('TYPE_')}
                                                                >
                                                                    {type.toUpperCase()}
                                                                </Button>
                                                            )
                                                        }
                                                    </div>
                                                </List.Item>
                                            );
                                            if (index !== chain.length - 1) {
                                                listItem.push(
                                                    <List.Item key={_.uniqueId('ARROW_')}>
                                                        <Icon className='evo-arrow' name='arrow right' size='big'/>
                                                    </List.Item>
                                                )
                                            }
                                            return listItem;
                                        })
                                    }
                                </List>
                            </Grid.Row>);
                        }
                    })
                }
            </Grid>
        );
    }
}

export default withRouter(Evolutions);
