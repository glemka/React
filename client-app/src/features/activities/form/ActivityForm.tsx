import React, { useState, FormEvent, useContext, useEffect } from "react";
import { Segment, Form, Button, Grid } from "semantic-ui-react";
import { IActivity } from "../../../app/models/activity";
import { v4 as uuid } from "uuid";
import { observer } from "mobx-react-lite";
import ActivityStore from "../../../app/stores/activityStore";
import { RouteComponentProps } from "react-router-dom";

interface IDetailParams {
  id: string;
}
const ActivityForm: React.FC<RouteComponentProps<IDetailParams>> = ({
  match,
  history
}) => {
  const activityStore = useContext(ActivityStore);
  const {
    submitting,
    createActivity,
    editActivity,
    activity: initialFormState,
    loadActivity,
    clearActivity
  } = activityStore;

  const [activity, setActivity] = useState<IActivity>({
    id: "",
    title: "",
    description: "",
    category: "",
    date: "",
    city: "",
    venue: ""
  });

  useEffect(() => {
    if (match.params.id && activity.id.length === 0) {
      loadActivity(match.params.id).then(
        () => initialFormState && setActivity(initialFormState)
      );
    }
    return () => {
      clearActivity();
    };
  }, [
    loadActivity,
    clearActivity,
    match.params.id,
    initialFormState,
    activity.id.length
  ]);

  const handleInputChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.currentTarget;
    setActivity({ ...activity, [name]: value });
  };

  const handleSubmit = () => {
    if (activity.id.length === 0) {
      let newActivity = { ...activity, id: uuid() };
      createActivity(newActivity).then(() =>
        history.push(`/activities/${newActivity.id}`)
      );
    } else {
      editActivity(activity).then(() =>
        history.push(`/activities/${activity.id}`)
      );
    }
  };
  return (
    <Grid>
      <Grid.Column widtth={10}>
        <Segment clearing>
          <Form onSubmit={handleSubmit}>
            <Form.Input
              placeholder="title"
              name="title"
              value={activity.title}
              onChange={handleInputChange}
            />
            <Form.TextArea
              rows={2}
              placeholder="description"
              name="description"
              value={activity.description}
              onChange={handleInputChange}
            />
            <Form.Input
              placeholder="category"
              name="category"
              value={activity.category}
              onChange={handleInputChange}
            />
            <Form.Input
              type="datetime-local"
              name="date"
              placeholder="date"
              value={activity.date}
              onChange={handleInputChange}
            />
            <Form.Input
              placeholder="city"
              name="city"
              value={activity.city}
              onChange={handleInputChange}
            />
            <Form.Input
              placeholder="venue"
              name="venue"
              value={activity.venue}
              onChange={handleInputChange}
            />
            <Button
              floated="right"
              positive
              type="submit"
              content="Submit"
              loading={submitting}
            />
            <Button
              floated="right"
              type="button"
              color="grey"
              content="Cancel"
              onClick={() => history.push("/activities")}
            />
          </Form>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityForm);
