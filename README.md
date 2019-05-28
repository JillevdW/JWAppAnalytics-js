This package is part of a group that, when installed together, will allow for easy self-hosted mobile app analytics. Without a [backend counterpart](https://github.com/JillevdW/app-analytics), this package doesn't do anything.

This package can be used with a wide variety of hybrid app frameworks, and this README will highlight how to use this package with each of them.

## Basic installation

Install the package with NPM:

```
npm i jw-app-analytics
```

## Basic usage

You can trigger events by calling the `trigger` method like this:

```typescript
// This triggers an event you should have registered in your backend. It's always nice to register an 'open_app' event.
AnalyticsService.shared.trigger('open_app');
```

To enable the tracking of user sessions in your app you'll need to pass `true` to the `userJourneyEnabled` parameter of the `setup` function:

```typescript
AnalyticsService.shared.setup('http://127.0.0.1:8000', info.uuid, true);
```

## Ionic Setup (Capacitor)

Add the following imports to your `AppComponent.ts`:

```typescript
import { Plugins, AppState } from '@capacitor/core';
import { AnalyticsService } from 'jw-app-analytics';
const { App } = Plugins;
const { Device } = Plugins;
```

Then add the following code to the `initializeApp` function:

```typescript
Device.getInfo().then(info => {
    AnalyticsService.shared.setup('http://127.0.0.1:8000', info.uuid);
    AnalyticsService.shared.trigger('open_app');
    App.addListener('appStateChange', (state: AppState) => {
        if (state.isActive) {
            AnalyticsService.shared.willEnterForeground();
        } else {
            AnalyticsService.shared.didEnterBackground();
        }
    });
});
```

## React Native Setup

Add the following imports to your `App.js`:

```javascript
import { AppState } from 'react-native';
import * as DeviceInfo from 'react-native-device-info';
import { AnalyticsService } from 'jw-app-analytics';
```

Then add the following properties to the state:

```javascript
state = {
    appState: AppState.currentState,
};
```

Then implement the `componentDidMount` and `componentWillUnmount` as shown below:

```javascript
componentDidMount() {
    const appId = DeviceInfo.default.getUniqueID();
    AnalyticsService.shared.setup('http://127.0.0.1:8000', appId);
    AnalyticsService.shared.trigger('open_app');
    AppState.addEventListener('change', this._handleAppStateChange);
}

componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
}

_handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
        AnalyticsService.shared.willEnterForeground();
    } else if (this.state.appState.match(/active/) && nextAppState.match(/background/)) {
        AnalyticsService.shared.didEnterBackground();
    }
    this.setState({ appState: nextAppState });
}
```
