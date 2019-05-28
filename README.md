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

To enable the tracking of user sessions in your app you'll need to pass `true` to the `userJourneyEnabled` parameter of the `setup` function:

```typescript
AnalyticsService.shared.setup('http://127.0.0.1:8000', info.uuid, true);
```
