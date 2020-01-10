import { observable, action, computed, configure, runInAction } from "mobx";
import { IActivity } from "../models/activity";
import { createContext, SyntheticEvent } from "react";
import agent from "../api/agent";

configure({ enforceActions: "always" });

class ActivityStore {
  @observable activityRegistry = new Map();
  @observable loadingInitial: boolean = false;
  @observable activity: IActivity | null = null;
  @observable submitting: boolean = false;
  @observable target: string = "";

  @computed get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );
  }

  @action
  loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const acticities = await agent.Activities.list();
      runInAction("loading activities", () => {
        acticities.forEach(act => {
          act.date = act.date.split(".")[0];
          this.activityRegistry.set(act.id, act);
        });
        this.loadingInitial = false;
      });
    } catch (error) {
      runInAction("load activities error", () => {
        this.loadingInitial = false;
      });
      console.log(error);
    }
  };

  @action
  loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
      this.activity = activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('gettig activity', ()=>{
         this.activity = activity
         this.loadingInitial = false;
        })
      } catch (error) {
        runInAction('get activity error', ()=>{
          this.loadingInitial = false;
         })
        console.log(error);
      }
    }
  };

  @action
  clearActivity = ()=>{
    this.activity = null
  }

  getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };


  @action
  editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction("editing activity", () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
      });
    } catch (error) {
      runInAction("edit actvity error", () => {
        this.submitting = false;
      });
      console.log(error);
    }
  };

  @action
  deleteActivity = async (
    event: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    this.submitting = true;
    this.target = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      runInAction("deleting activity", () => {
        this.activityRegistry.delete(id);
        this.target = "";
        this.submitting = false;
      });
    } catch (error) {
      runInAction("delete activity error", () => {
        this.target = "";
        this.submitting = false;
      });
      console.log(error);
    }
  };

  @action
  createActivity = async (activity: IActivity) => {
    this.submitting = true;

    try {
      await agent.Activities.create(activity);
      runInAction("creating activity", () => {
        this.activityRegistry.set(activity.id, activity);
        this.submitting = false;
      });
    } catch (error) {
      runInAction("create activity error", () => {
        this.submitting = false;
      });
      console.log(error);
    }
  };
}

export default createContext(new ActivityStore());
