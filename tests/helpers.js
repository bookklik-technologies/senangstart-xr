/**
 * Shared test helpers: minimal entity mock + a component instance factory
 * that emulates the A-Frame setAttribute -> data -> update(oldData) flow,
 * so state-driven components (toggle/radio/buttons) can be tested without
 * a full A-Frame runtime.
 */
function makeEntity() {
  return {
    attributes: {},
    children: [],
    components: {},
    hasLoaded: false,
    setAttribute(name, value, propertyValue) {
      this.attributes[name] = propertyValue === undefined ? value : propertyValue;
    },
    getAttribute() {
      return null;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener() {},
    removeEventListener() {},
    emit() {},
    insertBefore(child) {
      this.children.push(child);
      return child;
    },
  };
}

/**
 * Creates a component instance wired to a mock entity that emulates the
 * A-Frame update cycle: setAttribute(componentName, prop, value) merges the
 * parsed value into `data` and invokes update(oldData).
 *
 * `overrides` are assigned onto the entity before init runs (e.g.
 * getAttribute, object3D, getChildEntities).
 */
function createComponentInstance(name, componentDefinition, data, overrides) {
  const el = makeEntity();
  const listeners = {};
  const instance = Object.assign({}, componentDefinition, {el, data});

  el.addEventListener = function (evtName, handler) {
    (listeners[evtName] = listeners[evtName] || []).push(handler);
  };
  el.removeEventListener = function (evtName, handler) {
    const arr = listeners[evtName] || [];
    const index = arr.indexOf(handler);
    if (index !== -1) { arr.splice(index, 1); }
  };
  el.emit = function (evtName, detail) {
    (listeners[evtName] || []).slice().forEach(function (handler) {
      handler({detail});
    });
  };
  el.setAttribute = function (attr, a2, a3) {
    if (attr === name && a3 !== undefined) {
      el.attributes[attr] = a3;
      const oldData = Object.assign({}, data);
      data[a2] = a3 === 'true' ? true : a3 === 'false' ? false : a3;
      instance.update(oldData);
      return;
    }
    if (attr === name && a2 !== null && typeof a2 === 'object') {
      const oldData = Object.assign({}, data);
      Object.assign(data, a2);
      instance.update(oldData);
      return;
    }
    if (attr === name) {
      const oldData = Object.assign({}, data);
      Object.assign(data, {value: a2});
      instance.update(oldData);
      return;
    }
    el.attributes[attr] = a3 === undefined ? a2 : a3;
  };
  el.components[name] = instance;

  if (overrides) {
    Object.keys(overrides).forEach(function (key) {
      el[key] = overrides[key];
    });
  }

  return {el, instance, listeners, data};
}

module.exports = {makeEntity, createComponentInstance};
