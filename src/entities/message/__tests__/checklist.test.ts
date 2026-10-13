import { checklistFromText, isChecklist, parseChecklist } from '../model/checklist';

let mockId = 0;
jest.mock('../../../shared/lib', () => ({ generateId: () => `item-${++mockId}` }));

beforeEach(() => { mockId = 0; });

describe('checklist text', () => {
  it('creates one unchecked item per nonempty explicit line including the last line', () => {
    expect(checklistFromText(' молоко\r\nкефир\n\n Coca-Cola \nсода\n')).toEqual([
      { id: 'item-1', text: 'молоко', checked: false },
      { id: 'item-2', text: 'кефир', checked: false },
      { id: 'item-3', text: 'Coca-Cola', checked: false },
      { id: 'item-4', text: 'сода', checked: false },
    ]);
  });

  it('does not create empty items', () => {
    expect(checklistFromText(' \n\n\t')).toEqual([]);
  });

  it('keeps each duplicate independent when unchanged lines are reordered', () => {
    const old = [
      { id: 'a', text: 'Milk', checked: true },
      { id: 'b', text: 'Milk', checked: false },
      { id: 'c', text: 'Soda', checked: true },
    ];
    expect(checklistFromText('Soda\nMilk\nMilk\nBread', old)).toEqual([
      old[2], old[0], old[1], { id: 'item-1', text: 'Bread', checked: false },
    ]);
    expect(old.map(item => item.checked)).toEqual([true, false, true]);
  });

  it('does not transfer a removed or renamed item’s completion to a new line', () => {
    expect(checklistFromText('Kefir', [{ id: 'a', text: 'Milk', checked: true }]))
      .toEqual([{ id: 'item-1', text: 'Kefir', checked: false }]);
  });
});

describe('checklist validation', () => {
  const item = { id: 'a', text: 'Milk', checked: true };

  it.each([
    null, {}, [], [null], [{ ...item, id: '' }], [{ ...item, id: 1 }],
    [{ ...item, text: '' }], [{ ...item, text: '  ' }], [{ ...item, text: 1 }],
    [{ ...item, text: 'A\nB' }], [{ ...item, text: 'A\rB' }],
    [{ ...item, checked: 1 }], [item, item],
  ].map(value => ({ value })))('rejects invalid data: $value', ({ value }) => {
    expect(isChecklist(value)).toBe(false);
  });

  it('reads valid persisted completion state', () => {
    expect(parseChecklist(JSON.stringify([item]))).toEqual([item]);
  });

  it.each([undefined, null, 'broken JSON', '{}', '[]'])('tolerates missing or corrupt storage: %j', value => {
    expect(parseChecklist(value)).toBeNull();
  });
});
