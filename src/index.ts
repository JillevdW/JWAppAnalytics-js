export class AnalyticsService {

    static shared = new AnalyticsService();

    private apiUrl: string | null = null;

    private uuid: string | null = null;

    private userJourneyEnabled = false;

    private userJourney: UserJourney | null = null;

    private sessionProperties = {};

    public setup(withUrl: string, uuid: string, userJourneyEnabled: boolean = false): void {
        this.apiUrl = `${withUrl}/app-analytics-api`;
        this.uuid = uuid;
        this.userJourneyEnabled = userJourneyEnabled;

        if (userJourneyEnabled) {
            this.userJourney = new UserJourney(uuid, []);
        }
    }

    public trigger(event: string, properties: object = {}): void {
        if (!this.apiUrl || !this.uuid) {
            return;
        }

        const data = JSON.stringify({
            device_id: this.uuid,
            metric_name: event,
            properties
        });

        const xhr = new XMLHttpRequest();

        xhr.open('POST', `${this.apiUrl}/events`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('cache-control', 'no-cache');
        xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true');

        xhr.send(data);

        // Add to userJourney object.
        this.addToUserJourney(event);
    }

    public willEnterForeground(): void {
        if (this.userJourney) {
            this.userJourney.events = [];
        }
        this.clearSessionProperties();
        this.trigger('open_app');
    }

    public didEnterBackground(): void {
        if (!this.userJourney) {
            return;
        }
        this.addToUserJourney('close_app');
        this.send(this.userJourney);
    }

    public addSessionProperties(properties: object) {
        this.sessionProperties = {...this.sessionProperties, ...properties};
    }

    public clearSessionProperties() {
        this.sessionProperties = {};
    }

    private addToUserJourney(event: string): void {
        if (!this.userJourneyEnabled || !this.userJourney) {
            return;
        }

        const now = new Date();
        const month = now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : `${now.getMonth() + 1}`;
        const day = now.getDate() < 10 ? `0${now.getDate()}` : `${now.getDate()}`;
        const hours = now.getHours() < 10 ? `0${now.getHours()}` : `${now.getHours()}`;
        const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : `${now.getMinutes()}`;
        const seconds = now.getSeconds() < 10 ? `0${now.getSeconds()}` : `${now.getSeconds()}`;

        const nowString = `${now.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        this.userJourney.events.push({
            event,
            date: nowString
        });
    }

    private send(userJourney: UserJourney): void {
        if (!this.apiUrl) {
            return;
        }

        const data = JSON.stringify({
            device_id: userJourney.uuid,
            events: userJourney.events,
            properties: this.sessionProperties
        });

        const xhr = new XMLHttpRequest();

        xhr.open('POST', `${this.apiUrl}/app-session`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('cache-control', 'no-cache');
        xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true');

        xhr.send(data);
    }

}

class UserJourney {
    uuid: string;
    events: Array<object>;

    constructor(uuid: string, events: Array<object>) {
        this.uuid = uuid;
        this.events = events;
    }
}
