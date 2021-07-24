import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { List, Grid, Image, Header, Button, Icon } from 'semantic-ui-react';
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
    }

    componentDidMount() {
        this.props.list.forEach(id => {
           this.getPokemon(id)
        });
        console.log(this.props.evolutions)
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

    handleClick(id) {
        // console.log('id',id[0])
        // console.log('prop', this.props.currentId)
        // console.log(id[0] == this.props.currentId)
        if (id[0] != this.props.currentId)
            this.props.getPokemon(id);
    }

    render() {
        const sprites = this.state.sprites;
        const types = this.state.types;
        if(Object.keys(sprites).length !== this.props.list.length) {
            console.log('load')
            return <div />
        }
        console.log('finish load', this.state.sprites)
        console.log(this.state.types)
        return (
            <Grid id='evo-grid'>
                {
                    this.props.evolutions.map((chain, index) =>
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
                                                <div className='evolution-header'>{Object.keys(pokemon)}
                                                    <span> #{Object.values(pokemon)}</span>
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
                                                    <Icon className='evo-arrow' name='arrow right' size='big' />
                                                </List.Item>
                                            )
                                        }
                                        return listItem;
                                    })
                                }
                            </List>
                        </Grid.Row>
                    )
                }
            </Grid>
        );
    }
}

export default Evolutions;
