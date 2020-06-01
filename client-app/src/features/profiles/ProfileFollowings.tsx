import React, { useContext } from 'react';
import { RootStoreContext } from '../../app/stores/rootStore';
import { TabPane, Grid, GridColumn, Header, Card } from 'semantic-ui-react';
import ProfileCard from './ProfileCard';

const ProfileFollowings = () => {
  const rootStore = useContext(RootStoreContext);
  const { profile, followings, loading, activeTab } = rootStore.profileStore;

  return (
    <TabPane loading={loading}>
      <Grid>
        <GridColumn width={16}>
          <Header
            floated="left"
            icon="user"
            content={
              activeTab === 3
                ? `People following ${profile?.displayName}`
                : `People ${profile?.displayName} is following`
            }
          />
        </GridColumn>
        <GridColumn width={16}>
          <Card.Group itemsPerRow={5}>
            {followings.map((profile) => (
              <ProfileCard key={profile.username} profile={profile} />
            ))}
          </Card.Group>
        </GridColumn>
      </Grid>
    </TabPane>
  );
};

export default ProfileFollowings;
