import React, { useState, useContext, useEffect } from "react";
import { Segment, Form, Button, Grid } from "semantic-ui-react";
import { ActivityFormValues } from "../../../app/models/activity";
import { v4 as uuid } from "uuid";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router-dom";
import { Form as FinalForm, Field } from "react-final-form";
import TextInput from "../../../app/common/form/TextInput";
import TextAreaInput from "../../../app/common/form/TextAreaInput";
import SelectInput from "../../../app/common/form/SelectInput";
import { category } from "../../../app/common/options/categoryOptions";
import DateInput from "../../../app/common/form/DateInput";
import { combibedDateAndTime } from "../../../app/common/util/util";
import {
  combineValidators,
  composeValidators,
  isRequired,
  hasLengthGreaterThan
} from "revalidate";
import { RootStoreContext } from "../../../app/stores/rootStore";

const validate = combineValidators({
  title: isRequired({ message: "The title is required" }),
  category: isRequired("Category"),
  description: composeValidators(
    isRequired("Description"),
    hasLengthGreaterThan(4)({
      message: "Description to short (at least 4 characters)"
    })
  )(),
  city: isRequired("City"),
  venue: isRequired("Venu"),
  date: isRequired("Date"),
  time: isRequired("Time")
});

interface IDetailParams {
  id: string;
}
const ActivityForm: React.FC<RouteComponentProps<IDetailParams>> = ({
  match,
  history
}) => {
  const rootStore = useContext(RootStoreContext);
  const {
    submitting,
    createActivity,
    editActivity,
    loadActivity
  } = rootStore.activityStore;

  const [activity, setActivity] = useState(new ActivityFormValues());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (match.params.id) {
      setLoading(true);
      loadActivity(match.params.id)
        .then(activity => setActivity(new ActivityFormValues(activity)))
        .finally(() => setLoading(false));
    }
  }, [match.params.id, loadActivity]);

  const handleFinalFormSubmit = (values: any) => {
    const dateAndTime = combibedDateAndTime(values.date, values.time);
    const { date, time, ...activity } = values;
    activity.date = dateAndTime;
    console.log(activity);
    if (!activity.id) {
      let newActivity = { ...activity, id: uuid() };
      createActivity(newActivity);
    } else {
      editActivity(activity);
    }
  };

  return (
    <Grid>
      <Grid.Column widtth={10}>
        <Segment clearing>
          <FinalForm
            validate={validate}
            initialValues={activity}
            onSubmit={handleFinalFormSubmit}
            render={({ handleSubmit, invalid, pristine }) => (
              <Form onSubmit={handleSubmit} loading={loading}>
                <Field
                  placeholder="title"
                  name="title"
                  value={activity.title}
                  component={TextInput}
                />
                <Field
                  placeholder="description"
                  name="description"
                  value={activity.description}
                  rows={3}
                  component={TextAreaInput}
                />
                <Field
                  placeholder="category"
                  name="category"
                  value={activity.category}
                  component={SelectInput}
                  options={category}
                />
                <Form.Group widths="equal">
                  <Field<Date>
                    name="date"
                    placeholder="date"
                    date={true}
                    value={activity.date}
                    component={DateInput}
                  />
                  <Field<Date>
                    name="time"
                    placeholder="time"
                    time={true}
                    value={activity.time}
                    component={DateInput}
                  />
                </Form.Group>
                <Field
                  placeholder="city"
                  name="city"
                  value={activity.city}
                  component={TextInput}
                />
                <Field
                  placeholder="venue"
                  name="venue"
                  value={activity.venue}
                  component={TextInput}
                />
                <Button
                  floated="right"
                  positive
                  type="submit"
                  content="Submit"
                  loading={submitting}
                  disabled={loading || invalid || pristine}
                />
                <Button
                  floated="right"
                  type="button"
                  color="grey"
                  content="Cancel"
                  disabled={loading}
                  onClick={
                    activity.id
                      ? () => history.push(`/activities/${activity.id}`)
                      : () => history.push("/activities")
                  }
                />
              </Form>
            )}
          />
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityForm);
