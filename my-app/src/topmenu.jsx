import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Image, Menu } from 'semantic-ui-react';

/**
 * the top menu component
 */
class TopMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeItem: 'home'
        }
    }

    render() {
        return (
            <Menu pointing secondary id='top-menu'>
                <Menu.Item
                    active={this.state.activeItem === 'home'}
                    onClick={() => this.setState({ activeItem: 'home' })}
                >
                    <Image className='logo' src='../pokeball-logo.png' />
                    <span id='menu-header'>
                        React-Pokedex
                    </span>
                </Menu.Item>
                <Menu.Item
                    position='right'
                    name='Single'
                    active={this.state.activeItem === 'single'}
                    onClick={() => this.setState({ activeItem: 'single' })}
                />
                <Menu.Item
                    name='About'
                    active={this.state.activeItem === 'about'}
                    onClick={() => this.setState({ activeItem: 'about' })}
                />
            </Menu>
        );
    }
}

export default TopMenu;
