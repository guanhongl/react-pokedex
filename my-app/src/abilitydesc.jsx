import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Container, Dimmer, Header } from 'semantic-ui-react';

/**
 * the home page component
 */
class AbilityDesc extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Dimmer active={this.props.active} onClickOutside={this.props.handleClose} page>
                <Container>
                    <Header as='h2' icon inverted>
                        {/*<Icon name='heart' />*/}
                        {this.props.ability}
                        <Header.Subheader>{this.props.desc}</Header.Subheader>
                    </Header>
                </Container>
            </Dimmer>
        );
    }
}

export default AbilityDesc;
