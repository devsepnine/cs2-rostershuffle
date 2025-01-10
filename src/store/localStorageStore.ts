import {writable, type Writable} from 'svelte/store';

export function localStorageWritable<T>(key: string, initialValue: T): Writable<T> {
  // 로컬 스토리지 값 읽기
  let storedValue = initialValue;
  if (typeof localStorage !== 'undefined') {
    const json = localStorage.getItem(key);
    if (json) {
      try {
        storedValue = JSON.parse(json);
      } catch (e) {
        console.error(`로컬 스토리지 파싱 오류: ${e}`);
      }
    }
  }

  // 스토어 생성 및 로컬 스토리지 동기화
  const store = writable<T>(storedValue);
  store.subscribe(value => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });

  return store;
}
