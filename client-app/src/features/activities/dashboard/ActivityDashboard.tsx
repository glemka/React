import React from "react";
import { Grid } from "semantic-ui-react";
import { IActivity } from "../../../app/models/activity";
import ActivityList from "../list/ActivityList";
import ActivityDetails from "../details/ActivityDetails";
import ActivityForm from "../form/ActivityForm";

interface IProps {
  activities: IActivity[];
  selectedActivity: IActivity;
  selectActivity: (id:string)=>void
}
const ActivityDashboard: React.FC<IProps> = ({ activities, selectedActivity, selectActivity }) => {
  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityList activities={activities} selectActivity={selectActivity}></ActivityList>
      </Grid.Column>
      <Grid.Column width={6}>
          {selectedActivity && 
          <ActivityDetails activity = {selectedActivity}/>
}
          <ActivityForm/>
      </Grid.Column>
    </Grid>
  );
};

export default ActivityDashboard;
