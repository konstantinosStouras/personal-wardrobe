import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accountIdentity,accountButtonMarkup} from '../dist/account-ui.js';
test('signed-in identity prefers the saved name and securely renders provider photos',()=>{
 const user={displayName:'Konstantinos Stouras',email:'owner@example.com',photoURL:'https://example.com/avatar.jpg'};
 assert.deepEqual(accountIdentity(user,'Kostas Stouras'),{name:'Kostas Stouras',initials:'KS',photo:'https://example.com/avatar.jpg'});
 const html=accountButtonMarkup(user,'<Kostas>');assert.match(html,/&lt;Kostas&gt;/);assert.doesNotMatch(html,/<Kostas>/);assert.match(html,/referrerpolicy="no-referrer"/);
});
test('missing or unsafe photos use initials; guests show registration',()=>{
 for(const photoURL of [undefined,'javascript:alert(1)','data:image/svg+xml,<svg/>','https://user:password@example.com/pic']){
  assert.equal(accountIdentity({displayName:'Alex Smith',photoURL}).photo,'');assert.doesNotMatch(accountButtonMarkup({displayName:'Alex Smith',photoURL}),/<img/);
 }
 assert.match(accountButtonMarkup({displayName:'Alex Smith'}),/AS/);assert.equal(accountButtonMarkup(null),'Sign in / Register');
});
