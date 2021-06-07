# porter-restock

Polls the Mr. Porter API, finds new products and pushes them to the top of the page

## Caveats

* Sometimes an item will come back to stock minutes after they come back to the API
* Sometimes it will not come back to stock at all
* Sometimes it will show as a restock though it was always there

These are all unexplained bugs in the Mr. Porter API itself, products will drop off and come back with no apparent reason. But restocks do show up between all these false positives

## Usage

* `yarn`
* `node index.js`
* `http://localhost:3000/porter-restock`

## Updating

This codebase started more than 5 years ago, feel free to open a PR to move to fetch, ES6, and anything that will make this more readable/up to date
