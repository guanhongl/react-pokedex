import React from 'react';
import ReactDOM from 'react-dom';
import Pokedex from './pokedex.jsx';
import TopMenu from './topmenu';

class App extends React.Component {
    render() {
        return (
          <div>
              <TopMenu />
              <Pokedex />
          </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.querySelector('#root')
);
