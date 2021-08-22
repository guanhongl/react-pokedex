import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Image, Menu } from 'semantic-ui-react';
import logo from './pokeball-logo.png'

/**
 * the top menu component
 */
const TopMenu = () => {
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    return (
        <Menu pointing secondary id='top-menu'>
            <Link to='/'>
                <Menu.Item
                    as='div'
                    active={window.location.hash === '#/'}
                    onClick={forceUpdate}
                >
                    <Image className='logo' src={logo} alt='logo' />
                    <span id='menu-header'>
                        React-Pokedex
                    </span>
                </Menu.Item>
            </Link>
            <Menu.Item
                as='div'
                position='right'
                active={window.location.hash.includes('#/search')}
            >
                <Link to='/search/pokemon/pikachu' onClick={forceUpdate}>Search</Link>
            </Menu.Item>
            <Menu.Item
                as='div'
                active={window.location.hash === '#/list'}
            >
                <Link to='/list' onClick={forceUpdate}>List View</Link>
            </Menu.Item>
        </Menu>
    );
}

export default TopMenu;
