# reload-tab.ext

Reload tab periodically Chromium extension. 

* no spyware, no ads, no options page, only one persistent (background) page
* minimum amount is __1 minute__ (api restriction)
* timers are fired in sync (one main timer, to decrease the load)
* if Chrome (Google) decides that background persistent pages and/or timers
  are the devil, this extension will stop working of course

## installation

Same as [here](https://github.com/szkrd/new-tab.ext).

### using the build script

This method is not supported on Windows, sorry.

1. `npm i`
2. __optional__: put private key `reload-tab.pem` into the root directory of the repo (use openssl or Chromium to generate one)
3. `npm run build`
4. drag and drop the crx in _build_ to Chromium

### packaging with Chromium

1. `npm i`
2. open settings/extensions
3. enable developer mode
4. load unpacked extension
5. pack extension

### from the releases

1. download crx
2. drag and drop the crx file to the Chromium extensions page
