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
                    <Image
                        src='https://i.pinimg.com/originals/a9/4f/4d/a94f4d75a2e429a20838d28d2ae2b996.png'
                        size='mini'
                    />
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
