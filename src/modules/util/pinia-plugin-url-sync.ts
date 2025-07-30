import { PiniaPluginContext } from "pinia";

interface SyncConfigEntry {
  name: string;           // Object name/path in pinia store
  url?: string;           // Alternative name of url param, defaults to name
  serialize?: (value: any) => string;   // Convert state to url string
  deserialize?: (value: string) => any; // Convert url string to state
  valid?: (value: any) => boolean;       // Run validation function after deserialization to filter invalid values
  default?: any;          // Default value (removes this value from url)
}

interface StoreWithRouter {
  $id: string;
  defaults: Record<string, any>;
  router: any;
  customConfig: Record<string, Record<string, any>>;
  [key: string]: any;
}

const defaultSerialize = (v: any): string => String(v);
const defaultDeserialize = (v: string): any => String(v);

function resolve(path: string, obj: any, separator = "."): any {
  const properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
}

function urlToState(store: StoreWithRouter, syncConfig: SyncConfigEntry[]): void {
  const { router, customConfig } = store;
  const route = router.currentRoute.value;
  store.defaults = {};

  // Override store default values with custom app config
  if (customConfig[store.$id]) {
    Object.entries(customConfig[store.$id]).forEach(([key, val]) => {
      store[key] = val;
    });
  }

  syncConfig.forEach((config: SyncConfigEntry) => {
    const param = config.url || config.name;
    const deserialize = config.deserialize || defaultDeserialize;

    // Save default value of merged app config
    store.defaults[config.name] = store[config.name];

    const query = { ...route.query };
    if (!(param in query)) {
      return;
    }
    try {
      console.info("Parse url param", param, route.query[param]);
      const value = deserialize(query[param] as string);
      if (config.valid && !config.valid(value)) {
        throw new TypeError("Validation failed");
      }
      // TODO: Resolve nested values
      store[config.name] = value;
    } catch (error) {
      console.error(`Invalid url param ${param} ${route.query[param]}: ${error}`);
      query[param] = undefined;
      router.replace({ query });
    }
  });
}

function stateToUrl(store: StoreWithRouter, syncConfig: SyncConfigEntry[]): void {
  const { router } = store;

  // Ensure defaults is initialized
  if (!store.defaults) {
    store.defaults = {};
  }

  const params = new URLSearchParams(window.location.search);
  syncConfig.forEach((config: SyncConfigEntry) => {
    const value = resolve(config.name, store);
    const param = config.url || config.name;
    const serialize = config.serialize || defaultSerialize;
    console.info("State update", config.name, value);

    if (config.name in store.defaults && serialize(store.defaults[config.name]) === serialize(value)) {
      params.delete(param);
    } else {
      params.set(param, serialize(value));
    }
  });
  window.history.pushState({}, "", `?${params.toString().replaceAll("%2C", ",")}`);
}

function createUrlSync({ options, store }: PiniaPluginContext): void {
  // console.info("createUrlSync", options);
  const urlsync = (options as any).urlsync;
  if (!urlsync?.enabled && !urlsync?.config) {
    return;
  }

  // Set state from url params on page load
  (store as StoreWithRouter).router.isReady().then(() => {
    urlToState(store as StoreWithRouter, urlsync.config);
  });

  // Subscribe to store updates and sync them to url params
  store.$subscribe(() => {
    stateToUrl(store as StoreWithRouter, urlsync.config);
  });
}

export default createUrlSync;
