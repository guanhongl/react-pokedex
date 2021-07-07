import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Container, Header, Image } from 'semantic-ui-react';
import axios from 'axios';

class Pokedex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pokemon: {
        name: '',
        sprite: '',
      }
    };
    this.getPokemon = this.getPokemon.bind(this);
  }

  componentDidMount() {
    this.getPokemon();
  }

  getPokemon() {
    axios.get('https://pokeapi.co/api/v2/pokemon/charizard')
        .then(response => {
          console.log(response.data);
          const pokemon = {};
          pokemon.name = response.data.name;
          pokemon.sprite = response.data.sprites.front_default;
          this.setState({ pokemon });
        })
        .catch(error => {
          console.log(error);
        });
  }

  render() {
    const pokemon = this.state.pokemon;

    return (
        <Container>
          <Header as='h1'>{pokemon.name}</Header>
          <Image src={pokemon.sprite} />
        </Container>
    );
  }
}

ReactDOM.render(
    <Pokedex/>,
    document.querySelector('#root')
);
