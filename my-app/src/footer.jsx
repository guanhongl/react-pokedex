import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Icon } from 'semantic-ui-react';

const Footer = () => {
    return (
        <div id='footer'>
            <h5>A webapp built by <u><a href='https://github.com/guanhongl' target='_blank'>Steven</a></u></h5>
            <span>Data fetched from <u><a href='https://pokeapi.co/' target='_blank'>PokeAPI</a></u></span>
            <div>
                <Icon name='github' />
                <span><u><a href='https://github.com/guanhongl/react-pokedex' target='_blank'>Visit the github page</a></u></span>
            </div>
        </div>
    );
};

export default Footer;
