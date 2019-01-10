import * as React from 'react';
import './index.less';
import Windmill from '../../src/index';
import { HookFunction } from '../../src/types';

import logo from './logo.png';

const baseMachine = new Windmill({
  initialState: 'inactive',
  name: 'toggle',
  states: {
    active: {
      on: {
        STAY: 'active',
        TOGGLE: 'inactive',
      },
    },
    inactive: {
      on: {TOGGLE: 'active'}
    },
  }
});


class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      str: ''
    }
  }
  public componentDidMount() {
    baseMachine.start().bindHooks({
      after: [this.mapStatusToState]
    }).transition('TOGGLE');
  }

  public toggleClick = () => {
    baseMachine.transition('TOGGLE');
  }

  public mapStatusToState: HookFunction = (currentState: string | undefined) => {
    switch(currentState) {
      case 'active':
        this.setState({
          str: 'active',
        });
        break;
      case 'inactive':
        this.setState({
          str: 'inactive',
        });
        break;
      default:
        this.setState({
          str: 'default',
        });
    }
  }
  public render() {

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" onClick={this.toggleClick} />
          <h1 className="App-title">Welcome to Windmill</h1>
        </header>
        <p className="App-intro">
          Click Windmill to Toggle State
        </p>
        <h2>{ this.state.str }</h2>
      </div>
    );
  }
}

export default App;
