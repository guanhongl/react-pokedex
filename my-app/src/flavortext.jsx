import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Button, Container, Dimmer, Header } from 'semantic-ui-react';
import axios from 'axios';
import * as _ from 'underscore';

/**
 * the flavor text modal
 */
class FlavorText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info: [],
            randomInfo: '',
        };
        this.getRandomInfo = this.getRandomInfo.bind(this);
    }

    componentDidMount() {
        this.getInfo();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.name !== prevProps.name) {
            this.getInfo();
        }
    }

    getInfo() {
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${this.props.name}`)
            .then(response => {
                const info = _.uniq(_.pluck(
                    _.filter(response.data.flavor_text_entries, info => info.language.name === 'en')
                , 'flavor_text'));
                this.setState({ info, randomInfo: info[0] });
            });
    }

    getRandomInfo() {
        const randomIndex = Math.floor(Math.random() * this.state.info.length);
        this.setState({ randomInfo: this.state.info[randomIndex].replace(/\f/g, ' ') });
    }

    render() {
        return (
            <Dimmer active={this.props.active} onClickOutside={this.props.handleClose} page>
                <Container id='info-div'>
                    <Header as='h2' icon inverted>
                        {this.props.name.replace('-', ' ')}
                        <Header.Subheader>{this.state.randomInfo.replace(/\f/g, ' ')}</Header.Subheader>
                    </Header>
                    <div>
                        <Button inverted icon='random' content='Get random entry' floated='right'
                                onClick={this.getRandomInfo} />
                    </div>
                </Container>
            </Dimmer>
        );
    }
}

export default FlavorText;
