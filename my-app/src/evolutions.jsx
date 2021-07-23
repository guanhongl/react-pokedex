import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { List } from 'semantic-ui-react';
import axios from 'axios';

class Evolutions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        };
        this.getPokemon = this.getPokemon.bind(this);
    }

    componentDidMount() {
        this.getPokemon(1)
        console.log(this.props.evolutions)
        this.props.evolutions.map((chain, index) => console.log(chain))
    }

    getPokemon(id) {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(response => {
                const sprite = response.data.sprites.front_default;
                const data = this.props.evolutions;

            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        if(this.state.data.length === 0) {
            console.log('load')
            return <div />
        }

        console.log('render')
        return (
            <div>
            </div>
        );
    }
}

export default Evolutions;
