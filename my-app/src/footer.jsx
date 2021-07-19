import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Grid, Icon } from 'semantic-ui-react';

class Footer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Grid container id='footer'>
                <Grid.Row columns={3}>
                    <Grid.Column>

                    </Grid.Column>
                    <Grid.Column>

                    </Grid.Column>
                    <Grid.Column>
                        <Icon name='github' />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export default Footer;
