export const EVENT_IDS = ['mehndi', 'baraat', 'walima'];
export const defaultSettings = {
  groom: 'Wajid Ali',
  host: 'With love & duas, from our family',
  message: 'Together with our family, we request the honour of your presence and your duas as we celebrate this blessed new chapter.',
  closing: 'We look forward to sharing our happiness with you.',
  events: [
    { id: 'mehndi', name: 'Mehndi', subtitle: 'An evening of colour, laughter & love', date: '2026-12-17', time: '19:00', venue: '', address: '', mapUrl: '' },
    { id: 'baraat', name: 'Baraat', subtitle: 'A celebration of love & new beginnings', date: '2026-12-18', time: '20:00', venue: '', address: '', mapUrl: '' },
    { id: 'walima', name: 'Walima', subtitle: 'With grateful hearts, together', date: '2026-12-20', time: '13:00', venue: '', address: '', mapUrl: '' },
  ],
};
export const demoGuests = [
  { id: 'demo-ahmed', name: 'Ahmed Ali', label: '', withFamily: true, events: [...EVENT_IDS] },
  { id: 'demo-usman', name: 'Usman Khan', label: '', withFamily: false, events: ['baraat'] },
  { id: 'demo-fatima', name: 'Fatima Ahmed', label: '', withFamily: true, events: ['mehndi', 'walima'] },
  { id: 'demo-hassan', name: 'Hassan Raza', label: '', withFamily: false, events: ['walima'] },
];
