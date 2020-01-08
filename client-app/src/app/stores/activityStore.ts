import { observable, action , computed} from "mobx";
import { IActivity } from "../models/activity";
import { createContext } from "react";
import agent from "../api/agent";
import { throws } from "assert";
class ActivityStore {
  @observable activities: IActivity[] = [];
  @observable loadingInitial: boolean = false;
  @observable selectedActivity: IActivity | undefined = undefined;
  @observable editMode: boolean = false;
  @observable submitting: boolean = false;


  @computed get activitiesByDate(){

       return this.activities.sort((a,b)=> Date.parse(a.date) - Date.parse(b.date) )
  }
  @action selectActivity = (id: string) => {
    this.selectedActivity = this.activities.find(ac => ac.id === id);
    this.editMode = false;
  };

  @action loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const acticities = await agent.Activities.list();
      acticities.forEach(act => {
        act.date = act.date.split(".")[0];
        this.activities.push(act);
      });
      this.loadingInitial = false;
    } catch (error) {
      console.log(error);
      this.loadingInitial = false;
    }

    //     agent.Activities.list()
    //       .then(activities => {
    //         acticities.forEach(act => {
    //           act.date = act.date.split(".")[0];
    //           this.activities.push(act);
    //         });
    //       })
    //       .catch(error => console.log(error))
    //       .finally(() => {
    //         this.loadingInitial = false;
    //       });
  };

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    await agent.Activities.create(activity);
    try {
      this.activities.push(activity);
      this.selectActivity(activity.id);
      this.editMode = false;
      this.submitting = false;
    } catch (error) {
      this.submitting = false;
      console.log(error);
    }
  };
  @action openCreateForm = () => {
    this.editMode = true;
    this.selectedActivity = undefined;
  };
}

export default createContext(new ActivityStore());
