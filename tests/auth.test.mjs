import test from 'node:test';
import assert from 'node:assert/strict';
import {accountStorageKey,passwordProblem,authMessage} from '../dist/auth-policy.js';
import {enabledProviders} from '../dist/firebase-config.js';
test('accounts cannot share a wardrobe storage namespace',()=>{
 assert.equal(accountStorageKey(null),'wardrobe.v1');
 assert.notEqual(accountStorageKey('alice'),accountStorageKey('bob'));
 assert.notEqual(accountStorageKey('alice'),accountStorageKey(null));
});
test('registration enforces the deployed password policy and confirmation',()=>{
 assert.ok(passwordProblem('short','short'));
 assert.ok(passwordProblem('a'.repeat(129),'a'.repeat(129)));
 assert.ok(passwordProblem('long passphrase','different phrase'));
 assert.equal(passwordProblem('a long unique passphrase','a long unique passphrase'),'');
});
test('authentication errors neither expose backend details nor distinguish missing users',()=>{
 assert.equal(authMessage({code:'auth/user-not-found'}),authMessage({code:'auth/wrong-password'}));
 assert.ok(!authMessage({message:'secret internal details'}).includes('secret'));
 assert.match(authMessage({code:'auth/popup-blocked'}),/Allow pop-ups/);
});
test('only configured social sign-in is advertised',()=>assert.deepEqual(enabledProviders,['google.com']));
