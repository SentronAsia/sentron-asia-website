let toastListener = null;

export function registerToastListener(listener) {
  toastListener = listener;
  return () => {
    toastListener = null;
  };
}

export function notify(message, type = 'info') {
  if (toastListener) {
    toastListener({ message, type, id: Date.now() });
  }
}

