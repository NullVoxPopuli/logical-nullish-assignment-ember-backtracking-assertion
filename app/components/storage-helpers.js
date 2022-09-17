import { createStorage, getValue, setValue } from 'ember-tracked-storage-polyfill';

/**
 * Copied from
 * https://github.com/NullVoxPopuli/ember-deep-tracked/blob/main/ember-deep-tracked/src/-private/utils.ts
 */

const COLLECTION = Symbol('__ COLLECTION __');

const STORAGES_CACHE = new WeakMap();

function ensureStorages(context) {
  let existing = STORAGES_CACHE.get(context);

  if (!existing) {
    existing = new Map();
    STORAGES_CACHE.set(context, existing);
  }

  return existing;
}

function storageFor(context, key) {
  let storages = ensureStorages(context);

  return storages.get(key);
}

export function initStorage(context, key, initialValue = null) {
  let storages = ensureStorages(context);

  let initialStorage = createStorage(initialValue, () => false);

  storages.set(key, initialStorage);

  return getValue(initialStorage);
}

export function hasStorage(context, key) {
  return Boolean(storageFor(context, key));
}

export function readStorage(context, key) {
  let storage = storageFor(context, key);

  if (storage === undefined) {
    return initStorage(context, key, null);
  }

  return getValue(storage);
}

export function updateStorage(context, key, value = null) {
  let storage = storageFor(context, key);

  if (!storage) {
    initStorage(context, key, value);

    return;
  }

  setValue(storage, value);
}

export function readCollection(context) {
  if (!hasStorage(context, COLLECTION)) {
    initStorage(context, COLLECTION, context);
  }

  return readStorage(context, COLLECTION);
}

export function dirtyCollection(context) {
  if (!hasStorage(context, COLLECTION)) {
    initStorage(context, COLLECTION, context);
  }

  return updateStorage(context, COLLECTION, context);
}

const BOUND_FUNS = new WeakMap();

export function fnCacheFor(context) {
  let fnCache = BOUND_FUNS.get(context);

  if (!fnCache) {
    fnCache = new Map();
    BOUND_FUNS.set(context, fnCache);
  }

  return fnCache; // as Map<keyof T, T[keyof T]>;
}
