import React, { Fragment, useState, useEffect, SyntheticEvent, useContext } from "react";
import { Container } from "semantic-ui-react";
import agent from "../api/agent";
import { IActivity } from "../models/activity";
import NavBar from "./nav/NavBar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import LoadingComponent from "./LoadingComponent";
import ActivityStore from '../stores/activityStore'
import {observer} from 'mobx-react-lite'

const App = () => {
  const activityStore = useContext(ActivityStore);

  const [activities, setActivities] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(
    null
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [target, setTarget] = useState<string>("");

  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMode(true);
  };
  
  const handleDeleteActivity = (
    event: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    setSubmitting(true);
    setTarget(event.currentTarget.name);
    agent.Activities.delete(id)
      .then(() => {
        setActivities([...activities.filter(ac => ac.id !== id)]);
      })
      .then(() => setSubmitting(false));
  };

  const handleCreateActivity = (activity: IActivity) => {
    setSubmitting(true);
    agent.Activities.create(activity)
      .then(() => {
        setActivities([...activities, activity]);
        setSelectedActivity(activity);
        setEditMode(false);
      })
      .then(() => setSubmitting(false));
  };

  const handleEditActivity = (activity: IActivity) => {
    setSubmitting(true);
    agent.Activities.update(activity.id, activity)
      .then(() => {
        setActivities([
          ...activities.filter(ac => ac.id !== activity.id),
          activity
        ]);
        setSelectedActivity(activity);
        setEditMode(false);
      })
      .then(() => setSubmitting(false));
  };
  useEffect(() => {
    activityStore.loadActivities()
  }, [activityStore]);

  if (activityStore.loadingInitial) {
    return <LoadingComponent inverted={true} content="Loading activities" />;
  }
  return (
    <Fragment>
      <NavBar openCreateForm={handleOpenCreateForm} />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashboard
          setSelectedActivity={setSelectedActivity}
          setEditMode={setEditMode}
          createActivity={handleCreateActivity}
          editActivity={handleEditActivity}
          deleteActivity={handleDeleteActivity}
          submitting={submitting}
          target={target}
        />
      </Container>
    </Fragment>
  );
};
export default observer(App);
