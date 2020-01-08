import { observable, action } from "mobx";
import { IActivity } from "../models/activity";
import { createContext } from "react";
import agent from "../api/agent";
class ActivityStore {
  @observable activities: IActivity[] = [];
  @observable loadingInitial: boolean = false;
  @observable selectedActivity: IActivity | undefined = undefined;
  @observable editMode: boolean = false;

  @action selectActivity = (id: string) => {
    this.selectedActivity = this.activities.find(ac => ac.id === id);
    this.editMode = false;
  };

  @action loadActivities = () => {
    this.loadingInitial = true;
    agent.Activities.list()
      .then(response => {
        response.forEach(act => {
          act.date = act.date.split(".")[0];
          this.activities.push(act);
        });
      })
      .finally(() => {
        this.loadingInitial = false;
      });
  };
}

export default createContext(new ActivityStore());
