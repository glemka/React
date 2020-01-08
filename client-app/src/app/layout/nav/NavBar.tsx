import React, { useContext } from "react";
import { Menu, Container, Button } from "semantic-ui-react";
import ActivityStore from '../../stores/activityStore';
import { observer } from "mobx-react-lite";


const NavBar : React.FC= () => {
  const activityStore = useContext(ActivityStore)
  return (
    <Menu fixed="top" inverted>
      <Container>
        <Menu.Item name="Activities Application">
          <img src="/assets/logo.png" alt="logo"  style={{marginRight:'10px'}}/>
        </Menu.Item>
        <Menu.Item name="Activities" />
        <Menu.Item>
          <Button positive content="Create new" onClick={()=>activityStore.openCreateForm()}/>
        </Menu.Item>
      </Container>
    </Menu>
  );
};

export default observer(NavBar);
