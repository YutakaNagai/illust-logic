// ストレージの監視
const watchStorage = (event_name, storage_type, key) => {
  if (storage_type === "ls") {
    window.dispatchEvent(
      new CustomEvent(event_name, {
        detail: localStorage.getItem(key),
      })
    );
  } else {
    window.dispatchEvent(
      new CustomEvent(event_name, {
        detail: sessionStorage.getItem(key),
      })
    );
  }
};

export { watchStorage };
