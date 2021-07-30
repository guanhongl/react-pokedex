import React from 'react';
import ReactDOM from 'react-dom';
import Pokedex from './pokedex.jsx';
import TopMenu from './topmenu';
import Footer from './footer';
import Home from './home';
import List from './list';
import ErrorPage from './errorpage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

class App extends React.Component {
    render() {
        return (
            <Router>
                <div>
                    <TopMenu/>
                    <Switch>
                        <Route exact path='/'>
                            <Home />
                        </Route>
                        <Route exact path='/search/pokemon/:name'>
                            <Pokedex />
                        </Route>
                        <Route exact path='/list'>
                            <List />
                        </Route>
                        <Route path='*'>
                            <ErrorPage />
                        </Route>
                    </Switch>
                    <Footer/>
                </div>
            </Router>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.querySelector('#root')
);
