import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { List, Grid, Image, Header } from 'semantic-ui-react';
import axios from 'axios';

class Evolutions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sprites: {},
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
                this.setState({ sprites });
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        const sprites = this.state.sprites;
        if(Object.keys(sprites).length !== this.props.list.length) {
            console.log('load')
            return <div />
        }
        console.log('finish load', this.state.sprites)
        return (
            <Grid id='evolutions-grid'>
                {
                    this.props.evolutions.map((chain, index) =>
                        <Grid.Row centered>
                            <List horizontal relaxed>
                                {
                                    chain.map((pokemon, index) =>
                                        <List.Item>
                                            {/*{console.log(sprites[Object.values(pokemon)])}*/}
                                            <Image src={sprites[Object.values(pokemon)]} size='small' />
                                            <Header as='h3'>{Object.keys(pokemon)}</Header>
                                        </List.Item>
                                    )
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
