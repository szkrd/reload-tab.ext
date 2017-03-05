# reload-tab.ext

Reload tab periodically Chrome extension. 

* no spyware, no ads, no options page, no persistent background page
* minimum amount is __1 minute__ (Chrome api restriction)
* timers are fired in sync (one main timer, to decrease the load)

## installation

Same as [here](https://github.com/szkrd/new-tab.ext).

### using the build script

This method is not supported on Windows, sorry.

1. `npm i`
2. __optional__: put private key `reload-tab.pem` into the root directory of the repo (use openssl or Chrome to generate one)
3. `npm run build`
4. drag and drop the crx in _build_ to Chrome

### packaging with Chrome

1. `npm i`
2. open settings/extensions
3. enable developer mode
4. load unpacked extension
5. pack extension

### from the releases

1. download crx
2. drag and drop the crx file to the Chrome extensions page
