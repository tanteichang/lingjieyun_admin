const authEventTarget = new EventTarget();

const LOGIN_SUCCESS_EVENT = 'auth:login-success';

export function emitLoginSuccessEvent() {
  authEventTarget.dispatchEvent(new Event(LOGIN_SUCCESS_EVENT));
}

export function onLoginSuccessEvent(callback: () => void) {
  const listener = () => callback();
  authEventTarget.addEventListener(LOGIN_SUCCESS_EVENT, listener);

  return () => {
    authEventTarget.removeEventListener(LOGIN_SUCCESS_EVENT, listener);
  };
}
