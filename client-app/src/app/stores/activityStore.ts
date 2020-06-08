import { observable, action, computed, runInAction, reaction, toJS } from 'mobx';
import { IActivity } from '../models/activity';
import { SyntheticEvent } from 'react';
import agent from '../api/agent';
import { history } from '../..';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';
import { setActivityProps, createAttendee } from '../common/util/util';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';

const LIMIT = 2;

export default class ActivityStore {
  rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    reaction(
      () => this.predicate.keys(),
      () => {
        this.page = 0;
        this.activityRegistry.clear();
        this.loadActivities();
      }
    );
  }

  @observable activityRegistry = new Map();
  @observable loadingInitial: boolean = false;
  @observable activity: IActivity | null = null;
  @observable submitting: boolean = false;
  @observable target: string = '';
  @observable loading: boolean = false;
  @observable.ref hubConnection: HubConnection | null = null;
  @observable activityCount: number = 0;
  @observable page = 0;
  @observable predicate = new Map();

  @action setPredicate = (predicate: string, value: string | Date) => {
    this.predicate.clear();
    if (predicate !== 'all') {
      this.predicate.set(predicate, value);
    }
  };

  @computed get axiosParams() {
    const params = new URLSearchParams();
    params.append('limit', String(LIMIT));
    params.append('offset', `${this.page ? this.page * LIMIT : 0}`);
    this.predicate.forEach((value, key) => {
      if (key === 'startDate') {
        params.append(key, value.toISOString());
      } else {
        params.append(key, value);
      }
    });
    return params;
  }

  @computed get totalPages() {
    return Math.ceil(this.activityCount / LIMIT);
  }

  @action setPage = (page: number) => {
    this.page = page;
  };

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    );
  }

  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivities = activities.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    let grouppedActivities = sortedActivities.reduce((activities, activity) => {
      const date = activity.date.toISOString().split('T')[0];
      activities[date] = activities[date]
        ? [...activities[date], activity]
        : [activity];
      return activities;
    }, {} as { [key: string]: IActivity[] });

    return Object.entries(grouppedActivities);
  }

  @action createHubConnection = (activityId: string) => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_CHAT_URL!, {
        accessTokenFactory: () => this.rootStore.commonStore.token!,
      })
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log(this.hubConnection!.state))
      .then(() => {
        console.log('Attempting to join group');
        this.hubConnection!.invoke('AddToGroup', activityId);
      })
      .catch((error) => console.log('Error establishing connection: ', error));

    this.hubConnection.on('ReceiveComment', (comment) => {
      runInAction(() => this.activity!.comments.push(comment));
    });
    this.hubConnection.on('Send', (message) => {
      // toast.info(message);
    });
  };

  @action stopHubConnection = () => {
    this.hubConnection!.invoke('RemoveFromGroup', this.activity!.id)
      .then(() => this.hubConnection!.stop())
      .then(() => console.log('Connection stopped'))
      .catch((error) => console.log(error));
  };

  @action addComment = async (values: any) => {
    values.activityId = this.activity!.id;
    try {
      await this.hubConnection!.invoke('SendComment', values);
    } catch (error) {
      console.log(error);
    }
  };

  @action
  loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activitiesEnvelope = await agent.Activities.list(this.axiosParams);
      const { activities, activityCount } = activitiesEnvelope;
      runInAction('loading activities', () => {
        this.activityCount = activityCount;
        activities.forEach((act) => {
          setActivityProps(act, this.rootStore.userStore.user!);
          this.activityRegistry.set(act.id, act);
        });
        this.loadingInitial = false;
      });
    } catch (error) {
      runInAction('load activities error', () => {
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
      return toJS(activity); //to not return observable
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('gettig activity', () => {
          setActivityProps(activity, this.rootStore.userStore.user!);
          this.activity = activity;
          this.activityRegistry.set(activity.id, activity);
          this.loadingInitial = false;
        });
        return activity;
      } catch (error) {
        runInAction('get activity error', () => {
          this.loadingInitial = false;
        });
        console.log(error);
      }
    }
  };

  @action
  clearActivity = () => {
    this.activity = null;
  };

  getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };

  @action
  editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction('editing activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      runInAction('edit actvity error', () => {
        this.submitting = false;
      });
      toast.error('Problem submitting data');
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
      runInAction('deleting activity', () => {
        this.activityRegistry.delete(id);
        this.target = '';
        this.submitting = false;
      });
    } catch (error) {
      runInAction('delete activity error', () => {
        this.target = '';
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
      const attendee = createAttendee(this.rootStore.userStore.user!);
      attendee.isHost = true;
      let attendees = [];
      attendees.push(attendee);
      activity.attendees = attendees;
      activity.comments = [];
      activity.isHost = true;
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      runInAction('create activity error', () => {
        this.submitting = false;
      });
      toast.error('Problem submitting data');
      console.log(error.response);
    }
  };

  @action attendActivity = async () => {
    const attendee = createAttendee(this.rootStore.userStore.user!);

    this.loading = true;
    try {
      await agent.Activities.attend(this.activity!.id);
      runInAction(() => {
        if (this.activity) {
          this.activity.attendees.push(attendee);
          this.activity.isGoing = true;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.loading = false;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      toast.error('Problem signing up to activity');
    }
  };

  @action cancelAttendance = async () => {
    this.loading = true;
    try {
      await agent.Activities.unattend(this.activity!.id);
      runInAction(() => {
        if (this.activity) {
          this.activity.attendees = this.activity.attendees.filter(
            (a) => a.username !== this.rootStore.userStore.user!.username
          );

          this.activity.isGoing = false;
          this.activityRegistry.set(this.activity.id, this.activity);
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      toast.error('Problem canceling attendance');
    }
  };
}
