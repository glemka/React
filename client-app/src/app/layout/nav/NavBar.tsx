import React from "react";
import { Menu, Container, Button } from "semantic-ui-react";

interface IProps{
  openCreateForm : ()=>void;
}

const NavBar : React.FC<IProps>= ({openCreateForm}) => {
  return (
    <Menu fixed="top" inverted>
      <Container>
        <Menu.Item name="Activities Application">
          <img src="/assets/logo.png" alt="logo"  style={{marginRight:'10px'}}/>
        </Menu.Item>
        <Menu.Item name="Activities" />
        <Menu.Item>
          <Button positive content="Create new" onClick={()=>openCreateForm()}/>
        </Menu.Item>
      </Container>
    </Menu>
  );
};

export default NavBar;
