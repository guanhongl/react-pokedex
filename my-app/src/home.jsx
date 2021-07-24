import React from 'react';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import { Container } from 'semantic-ui-react';

/**
 * the home page component
 */
class Home extends React.Component {
    render() {
        return (
            <Container>
                <h1>home page</h1>
            </Container>
        )
    }
}

export default Home;
