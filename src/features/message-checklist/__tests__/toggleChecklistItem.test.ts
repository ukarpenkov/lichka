import { toggleChecklistItem } from '..';
import { toggleMessageChecklistItem } from '../../../entities/message';

jest.mock('../../../entities/message', () => ({
  ...jest.requireActual('../../../entities/message'),
  toggleMessageChecklistItem: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

it('saves the selected item in an ordinary message', () => {
  (toggleMessageChecklistItem as jest.Mock).mockReturnValue({ id: 'message' });
  expect(toggleChecklistItem('message', 'milk')).toEqual({ id: 'message' });
  expect(toggleMessageChecklistItem).toHaveBeenCalledWith('message', 'milk');
});

it('saves a periodic display item in its persisted template', () => {
  toggleChecklistItem('periodic:message', 'milk');
  expect(toggleMessageChecklistItem).toHaveBeenCalledWith('message', 'milk');
});
