import React, { Fragment, useState, useEffect, SyntheticEvent } from "react";
import { Container } from "semantic-ui-react";
import agent from "../api/agent";
import { IActivity } from "../models/activity";
import NavBar from "./nav/NavBar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import LoadingComponent from "./LoadingComponent";

const App = () => {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(
    null
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [target, setTarget] = useState<string>("");

  const handleSelectedActivity = (id: string) => {
    setSelectedActivity(activities.filter(ac => ac.id === id)[0]);
    setEditMode(false);
  };

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
    agent.Activities.list()
      .then(response => {
        let activities: IActivity[] = [];
        response.forEach(act => {
          act.date = act.date.split(".")[0];
          activities.push(act);
        });
        setActivities(activities);
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingComponent inverted={true} content="Loading activities" />;
  }
  return (
    <Fragment>
      <NavBar openCreateForm={handleOpenCreateForm} />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashboard
          activities={activities}
          editMode={editMode}
          selectedActivity={selectedActivity}
          selectActivity={handleSelectedActivity}
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
export default App;
