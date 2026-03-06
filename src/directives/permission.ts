import type { App, DirectiveBinding } from 'vue';

import { usePermissionStore } from '@/store';

type PermissionValue = string | string[];
type PermissionEffect = 'remove' | 'disable';

const disabledStateMap = new WeakMap<
  HTMLElement,
  {
    pointerEvents: string;
    opacity: string;
    cursor: string;
    title: string | null;
    ariaDisabled: string | null;
    disabledAttr: boolean;
    disabledProp: boolean | undefined;
    tabIndexAttr: string | null;
    clickBlocker: (event: Event) => void;
  }
>();

const removeElement = (el: HTMLElement) => {
  if (el.parentNode) {
    el.parentNode.removeChild(el);
  }
};

const applyDisableState = (el: HTMLElement) => {
  if (disabledStateMap.has(el)) {
    return;
  }

  const clickBlocker = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const state = {
    pointerEvents: el.style.pointerEvents,
    opacity: el.style.opacity,
    cursor: el.style.cursor,
    title: el.getAttribute('title'),
    ariaDisabled: el.getAttribute('aria-disabled'),
    disabledAttr: el.hasAttribute('disabled'),
    disabledProp: 'disabled' in el ? Boolean((el as HTMLInputElement).disabled) : undefined,
    tabIndexAttr: el.getAttribute('tabindex'),
    clickBlocker,
  };

  disabledStateMap.set(el, state);

  el.style.pointerEvents = 'auto';
  el.style.opacity = '0.6';
  el.style.cursor = 'not-allowed';
  if (!el.getAttribute('title')) {
    el.setAttribute('title', '没有该权限');
  }
  el.setAttribute('aria-disabled', 'true');
  el.setAttribute('tabindex', '-1');
  el.addEventListener('click', clickBlocker, true);

  if ('disabled' in el) {
    (el as HTMLInputElement).disabled = true;
  } else {
    el.setAttribute('disabled', 'true');
  }
};

const restoreDisableState = (el: HTMLElement) => {
  const state = disabledStateMap.get(el);
  if (!state) {
    return;
  }

  el.style.pointerEvents = state.pointerEvents;
  el.style.opacity = state.opacity;
  el.style.cursor = state.cursor;
  el.removeEventListener('click', state.clickBlocker, true);

  if (state.title == null) {
    el.removeAttribute('title');
  } else {
    el.setAttribute('title', state.title);
  }

  if (state.ariaDisabled == null) {
    el.removeAttribute('aria-disabled');
  } else {
    el.setAttribute('aria-disabled', state.ariaDisabled);
  }

  if (state.tabIndexAttr == null) {
    el.removeAttribute('tabindex');
  } else {
    el.setAttribute('tabindex', state.tabIndexAttr);
  }

  if ('disabled' in el && state.disabledProp !== undefined) {
    (el as HTMLInputElement).disabled = state.disabledProp;
  }

  if (state.disabledAttr) {
    el.setAttribute('disabled', 'true');
  } else if (!('disabled' in el)) {
    el.removeAttribute('disabled');
  }

  disabledStateMap.delete(el);
};

const getPermissionMode = (binding: DirectiveBinding<PermissionValue>): 'any' | 'all' => {
  if (binding.arg === 'all' || binding.arg === 'all-disable') {
    return 'all';
  }
  return 'any';
};

const getPermissionEffect = (binding: DirectiveBinding<PermissionValue>): PermissionEffect => {
  if (binding.modifiers.disable || binding.arg === 'disable' || binding.arg === 'all-disable') {
    return 'disable';
  }
  return 'remove';
};

const validatePermission = (binding: DirectiveBinding<PermissionValue>) => {
  const permissionStore = usePermissionStore();
  const value = binding.value;
  const mode = getPermissionMode(binding);
  if (!value) {
    return false;
  }

  if (Array.isArray(value)) {
    return mode === 'all' ? permissionStore.hasAll(value) : permissionStore.hasAny(value);
  }

  return permissionStore.has(value);
};

const permissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const effect = getPermissionEffect(binding);
    if (!validatePermission(binding)) {
      if (effect === 'disable') {
        applyDisableState(el);
        return;
      }
      removeElement(el);
      return;
    }
    restoreDisableState(el);
  },
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const effect = getPermissionEffect(binding);
    if (!validatePermission(binding)) {
      if (effect === 'disable') {
        applyDisableState(el);
        return;
      }
      removeElement(el);
      return;
    }
    restoreDisableState(el);
  },
};

export const setupPermissionDirective = (app: App) => {
  app.directive('permission', permissionDirective);
};
