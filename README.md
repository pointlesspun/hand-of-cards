# hand-of-cards (v0.3)
This is simple and limited React front-end carousel imitating holding and browsing through a hand of cards. To start the app, run a webserver in the directory containing the index.html file. Latest demo can be found on the [github pages](https://pointlesspun.github.io/hand-of-cards/).

<center>
    <img src="./data/screenshot.png" width="640" height="480"/>
</center>

## Controls:
* On a laptop/desktop: 
    * Use left / right arrows to select the next / previous card. Up and down to put a card in a 'selected' state.
    * Refresh the page to get a new set of random cards.

* On a device with a touch display:
    * Swipe left/right to select the next / previous card. Tap to toggle a card in a 'selected' state.
    * Refresh the page to get a new set of random cards.

## Configurable Attributes
In the top level element one can currently set the following attributes:

* "maxCards", maxium number of cards in the hand and initial set of cards
* "maxSelectedCards", maximum number of cards which can be selected. After that the user cannot select any more cards
* "isLocked", if set to true, the cards will not scroll but stay in place.

Example:
```html
  <div id="card-container" class="app-container" maxCards="9" maxSelectedCards="3" isLocked="false"></div>
```

## 'Design'

The design (such as it is) of the element consists of the following:

* App (app.js): entry point and configuration of the application.
  * HandOfCardsComponent (hand-of-cards-component.js): contains the event handlers and the carousel.
    * Carsousel (cards-carousel.js): maintains the active cards and contains the cards
        * Card (card.js): layout of the actual card.

## Status

This project was created while learning React and is currently very much under development. Clean-up and refactoring are very much in order. Outstanding features (in no particular order):

* Refactor & add documentation.
* Add jsx (or htm) variation.
* Add mouse support.
* Add 'playing' cards and getting random new ones.
* Try some optimization(s) for less powerful devices (aka phones).
* Show warning if max selection is reached.
* Deal truly random cards or one from a deck of 52 cards.
* Be able to switch between locked and unlocked mode via a button.

## Credits

Carousel Demonstration based on [this example](https://medium.com/tinyso/how-to-create-the-responsive-and-swipeable-carousel-slider-component-in-react-99f433364aa0")  by Thin Tran.
    
Swiping provided by [john-doherty/swiped-events](https://github.com/john-doherty/swiped-events).

Deck of cards [by Дмитрий Фомин (Dmitry Fomin) on Wiki](https://en.wikipedia.org/wiki/File:Atlasnye_playing_cards_deck.svg.) 
