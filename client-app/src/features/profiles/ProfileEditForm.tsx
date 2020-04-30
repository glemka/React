import React from "react";
import { IProfile } from "../../app/models/profile";
import { combineValidators, isRequired } from "revalidate";
import { Form as FinalForm, Field } from "react-final-form";
import { Form, Button } from "semantic-ui-react";
import TextInput from "../../app/common/form/TextInput";
import TextAreaInput from "../../app/common/form/TextAreaInput";

interface IProps {
  updateProfile: (profile: Partial<IProfile>) => void;
  profile: Partial<IProfile>;
}

const validate = combineValidators({
  displayName: isRequired("displayName"),
});
const ProfileEditForm: React.FC<IProps> = ({ profile, updateProfile }) => {
  return (
    <FinalForm
      onSubmit={updateProfile}
      validate={validate}
      initialValues={profile!}
      render={({ handleSubmit, pristine, submitting, invalid }) => (
        <Form onSubmit={handleSubmit} error>
          <Field
            component={TextInput}
            name="displayName"
            placeholder="Display Name"
            value={profile!.displayName}
          />
          <Field
            component={TextAreaInput}
            name="bio"
            rows={3}
            placeholder="Bio"
            value={profile!.bio}
          />
          <Button
            loading={submitting}
            floated="right"
            disabled={invalid || pristine}
            positive
            content='Update profile'
          />
        </Form>
      )}
    />
  );
};

export default ProfileEditForm;
