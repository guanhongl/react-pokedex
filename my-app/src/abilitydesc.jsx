import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Container, Dimmer, Header } from 'semantic-ui-react';

/**
 * the home page component
 */
const AbilityDesc = (props) => {
    return (
        <Dimmer active={props.active} onClickOutside={props.handleClose} page>
            <Container>
                <Header as='h2' icon inverted>
                    {/*<Icon name='heart' />*/}
                    {props.ability}
                    <Header.Subheader>{props.desc}</Header.Subheader>
                </Header>
            </Container>
        </Dimmer>
    );
}

export default AbilityDesc;
