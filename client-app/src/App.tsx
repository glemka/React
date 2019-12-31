import React, {Component} from 'react';
import { List, Header, Icon } from 'semantic-ui-react'
import axios from 'axios'

class App extends Component {
  state = {
    values : []
  };

  componentDidMount(){
    let values = axios.get("http://localhost:5000/api/values")
      .then((response)=>{
        this.setState({
          values: response.data
        })
      })
    
  }
  render(){
    return (
      <div className="App">
        <Header as="h2">
          <Icon name="users"/>
          <Header.Content>React App</Header.Content>
        </Header>
        <List>
          {
          this.state.values.map((value: any)=>  
            <List.Item key = {value.id}>{value.name} </List.Item>
            ) 
          }         
        </List>     
      </div>
    );
  }
}

export default App;