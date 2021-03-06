(function () {
/*global BroadcastChannel,
         ContactListController,
         onDomReady
*/

var debug = 0 ? console.log.bind(console, '[LIST]') : function(){};
var chromeless = !!~location.search.indexOf('chromeless');
var channel = new BroadcastChannel('navigate');
var isNested = window.parent !== window;
var controller;

var els = {
  header: document.querySelector('gaia-header'),
  list: document.querySelector('gaia-list')
};

document.body.addEventListener('click', (e) => {
  if (!isNested) { return; }

  e.preventDefault();

  var a = e.target.closest('a');
  if (!a) { return; }

  var id = a.hash.replace('#/', '');

  debug('link click', id);
  channel.postMessage(id);
});

els.header.hidden = chromeless;

function render() {
  var frag = document.createDocumentFragment();

  controller.getAll().then(function(contacts) {
    if (els.list.textContent) {
      els.list.textContent = '';
    }

    contacts.forEach(function(contact) {
      var el = document.createElement('a');
      el.textContent = getContactName(contact);
      el.href = 'views/detail/index.html#/' + contact._id;
      frag.appendChild(el);
    });

    els.list.appendChild(frag);
  });
}

function getContactName(contact) {
  var givenName = (contact.givenName && contact.givenName[0]) || '';
  var familyName = (contact.familyName && contact.familyName[0]) || '';

  if (givenName || familyName) {
    return givenName + ' ' + familyName;
  }

  if (contact.tel && contact.tel.length) {
    return contact.tel[0].value;
  }

  if (contact.email && contact.email.length) {
    return contact.email[0];
  }

  return '';
}

onDomReady().then(function() {
  importScripts('rendercache/api.js');
  controller = new ContactListController();
  // Re-render content once contact list is updated
  // TODO: This is very inefficient code, we should debounce this event handler
  // since we can have tons of consequent events if we fetched several records
  // during sync.
  controller.addEventListener('contactchange', render);
  render();
});

})();
