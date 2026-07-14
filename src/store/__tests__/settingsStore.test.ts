import { afterEach, describe, expect, test } from 'bun:test';

import { persistentStorage } from '@/services/storage/persistentStorage';
import { defaultSettings, useSettingsStore } from '@/store/settingsStore';

async function readPersistedState<T>(key: string): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 0));

  const raw = await persistentStorage.getItem(key);

  expect(raw).toBeString();

  return JSON.parse(raw as string).state as T;
}

describe('settingsStore', () => {
  afterEach(() => {
    useSettingsStore.getState().resetSettings();
  });

  test('uses the required defaults', () => {
    expect(useSettingsStore.getState()).toMatchObject(defaultSettings);
  });

  test('updates and resets settings', () => {
    useSettingsStore.getState().setShowMatureCategories(true);
    useSettingsStore.getState().setConfirmBeforeOpeningMagnetLinks(false);
    useSettingsStore.getState().setOpenProviderPagesExternally(false);
    useSettingsStore.getState().acknowledgeMagnetNotice();

    expect(useSettingsStore.getState()).toMatchObject({
      showMatureCategories: true,
      confirmBeforeOpeningMagnetLinks: false,
      openProviderPagesExternally: false,
      magnetNoticeAcknowledged: true,
    });

    useSettingsStore.getState().resetSettings();
    expect(useSettingsStore.getState()).toMatchObject(defaultSettings);
  });

  test('persists only settings values without store actions', async () => {
    useSettingsStore.getState().updateSettings({
      showMatureCategories: true,
      confirmBeforeOpeningMagnetLinks: false,
      openProviderPagesExternally: false,
    });

    const persisted = await readPersistedState<{
      showMatureCategories: boolean;
      confirmBeforeOpeningMagnetLinks: boolean;
      openProviderPagesExternally: boolean;
      magnetNoticeAcknowledged: boolean;
      updateSettings?: unknown;
    }>('torrentbay:settings');

    expect(persisted).toEqual({
      showMatureCategories: true,
      confirmBeforeOpeningMagnetLinks: false,
      openProviderPagesExternally: false,
      magnetNoticeAcknowledged: false,
    });
    expect(persisted.updateSettings).toBeUndefined();
  });
});
