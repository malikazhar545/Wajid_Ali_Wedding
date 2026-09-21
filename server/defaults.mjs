export const EVENT_IDS = ['mehndi', 'baraat', 'walima'];
export const defaultSettings = {
  groom: 'Wajid',
  host: 'With love, from our family',
  message: 'With grateful hearts and the blessings of Allah, we invite you to share in the joy of a beautiful new beginning.',
  closing: 'Your presence is our most cherished gift.',
  events: [
    { id: 'mehndi', name: 'Mehndi', subtitle: 'An evening of colour & joy', date: '', time: '', venue: '', address: '', mapUrl: '' },
    { id: 'baraat', name: 'Baraat', subtitle: 'The beginning of forever', date: '', time: '', venue: '', address: '', mapUrl: '' },
    { id: 'walima', name: 'Walima', subtitle: 'A celebration of togetherness', date: '', time: '', venue: '', address: '', mapUrl: '' },
  ],
};
export const demoGuests = [
  { id: 'demo-ahmed', name: 'Ahmed Ali', label: '', withFamily: true, events: [...EVENT_IDS] },
  { id: 'demo-usman', name: 'Usman Khan', label: '', withFamily: false, events: ['baraat'] },
  { id: 'demo-fatima', name: 'Fatima Ahmed', label: '', withFamily: true, events: ['mehndi', 'walima'] },
  { id: 'demo-hassan', name: 'Hassan Raza', label: '', withFamily: false, events: ['walima'] },
];
