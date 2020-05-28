import React from "react";
import { List, Image, Popup } from "semantic-ui-react";
import { IAttendee } from "../../../app/models/activity";

interface IProps {
  attendees: IAttendee[];
}
const styles ={
  borderColor: 'orange',
  borderWidth: 2
}
const ActivityListItemAttendees: React.FC<IProps> = ({ attendees }) => {
  return (
    <List horizontal>
      {attendees.map((attende) => (
        <List.Item key={attende.username}>
          <Popup
            header={attende.displayName}
            trigger={
              <Image
                size="mini"
                circular
                src={attende.image || `/assets/user.png`}
                bordered
                style={attende.following ? styles : null}
              />
            }
          />
        </List.Item>
      ))}
    </List>
  );
};

export default ActivityListItemAttendees;
