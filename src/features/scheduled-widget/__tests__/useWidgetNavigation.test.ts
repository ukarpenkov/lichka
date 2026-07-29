jest.mock('../../../shared/lib/scheduledWidget', () => ({
  getInitialWidgetOpenTarget: jest.fn(),
  getInitialWidgetMessageId: jest.fn(),
  consumeInitialWidgetOpen: jest.fn(),
}));

import {
  openScheduledTab,
  setMainTabsApi,
  setScheduledFocusListener,
  __resetMainTabsApiForTests,
  SCHEDULED_TAB_INDEX,
} from '../../../app/mainTabsApi';
import { handleWidgetOpen } from '../useWidgetNavigation';

describe('handleWidgetOpen', () => {
  const switchToTab = jest.fn();

  beforeEach(() => {
    __resetMainTabsApiForTests();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    setMainTabsApi({ switchToTab });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should open Scheduled tab without focus when messageId is missing', () => {
    handleWidgetOpen('scheduled');

    expect(switchToTab).toHaveBeenCalledWith(SCHEDULED_TAB_INDEX);
  });

  it('should open Scheduled tab and focus row when messageId is present', () => {
    const onFocus = jest.fn();
    setScheduledFocusListener(onFocus);

    handleWidgetOpen('scheduled', 'msg-7');

    expect(switchToTab).toHaveBeenCalledWith(SCHEDULED_TAB_INDEX);
    expect(onFocus).toHaveBeenCalledWith({
      messageId: 'msg-7',
      focusNonce: 1_700_000_000_000,
    });
  });

  it('should ignore unknown open targets', () => {
    handleWidgetOpen('settings');

    expect(switchToTab).not.toHaveBeenCalled();
  });
});

describe('openScheduledTab', () => {
  const switchToTab = jest.fn();

  beforeEach(() => {
    __resetMainTabsApiForTests();
    jest.clearAllMocks();
    setMainTabsApi({ switchToTab });
  });

  it('should queue tab switch when api is not ready yet', () => {
    __resetMainTabsApiForTests();
    openScheduledTab();

    expect(switchToTab).not.toHaveBeenCalled();

    setMainTabsApi({ switchToTab });
    expect(switchToTab).toHaveBeenCalledWith(SCHEDULED_TAB_INDEX);
  });
});
