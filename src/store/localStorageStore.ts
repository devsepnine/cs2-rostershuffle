import { writable, type Writable } from 'svelte/store';

const storeCache = new Map<string, Writable<any>>(); // 스토어 캐시

export function localStorageWritable<T>(key: string, initialValue: T): Writable<T> {
  // 스토어가 이미 존재하면 반환 (싱글톤 패턴)
  if (storeCache.has(key)) {
    return storeCache.get(key)!;
  }

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

  // Svelte 스토어 생성
  const store = writable<T>(storedValue);

  // 구독: 스토어가 업데이트될 때 로컬 스토리지 동기화
  store.subscribe(value => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });

  // 브라우저의 로컬 스토리지 변경을 감지하여 스토어 업데이트
  if (typeof window !== 'undefined') {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          store.set(JSON.parse(event.newValue));
        } catch (e) {
          console.error(`로컬 스토리지 이벤트 파싱 오류: ${e}`);
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    // 클린업: 이벤트 리스너 제거
    store.subscribe(() => {}); // 강제로 구독을 유지 (unsubscribe 방지)
    (store as any).destroy = () => {
      window.removeEventListener('storage', handleStorage);
    };
  }

  // 캐시에 저장
  storeCache.set(key, store);

  return store;
}
