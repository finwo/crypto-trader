import { getProperty, setProperty } from './object-path';
import { customRef } from 'vue';
import { format, parse } from 'date-fns';

export function dateRef(root, path, fmt = 'yyyy-MM-dd') {
  return customRef((track, trigger) => ({
    get() {
      track();
      const value = getProperty(root, path, undefined);
      if (isNaN(value)) return undefined;
      const dt    = new Date(parseFloat(value) * 1000);
      return format(dt, fmt);
    },
    set(value) {
      const dt = parse(value, fmt, new Date());
      setProperty(root, path, Math.floor(dt.getTime() / 1000));
      trigger();
    },
  }));
}
