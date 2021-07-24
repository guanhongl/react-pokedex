import React from 'react';
import { Link } from 'react-router-dom';
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
                <Link to='/'>
                    <Menu.Item
                        active={this.state.activeItem === 'home'}
                        onClick={() => this.setState({ activeItem: 'home' })}
                    >
                        <Image className='logo' src='../pokeball-logo.png' />
                        <span id='menu-header'>
                            React-Pokedex
                        </span>
                    </Menu.Item>
                </Link>
                <Menu.Item
                    position='right'
                    active={this.state.activeItem === 'single'}
                >
                    <Link to='/search' onClick={() => this.setState({ activeItem: 'single' })}>Search</Link>
                </Menu.Item>
                <Menu.Item
                    active={this.state.activeItem === 'about'}
                >
                    <Link to='/list' onClick={() => this.setState({ activeItem: 'about' })}>List View</Link>
                </Menu.Item>
            </Menu>
        );
    }
}

export default TopMenu;
