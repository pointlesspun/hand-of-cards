# hand-of-cards (v0.1)
This is simple and limited React front-end carousel imitating a hand of cards. To start the app run a webserver in the directory containing the index.html file. Latest demo can be found on the [github pages](https://pointlesspun.github.io/hand-of-cards/).

<center>
    <img src="./data/screenshot.png" width="640" height="480"/>
</center>


## Controls:
* On a laptop/desktop: 
    * Use left / right arrows to select the next / previous card. Up and down to put a card in a 'selected' state.

* On a device with a touch display:
    * Swipe left/right to select the next / previous card. Tap to toggle a card in a 'selected' state.


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
* Create a sprite Atlas.
* Randomize cards in hand.
* Add locked mode in which all cards are visible on screen.
* Replace indicators by dots and remove next, previous buttons.
* Add mouse support.
* Add 'playing' cards and getting random new ones.
* Try some optimization(s) for less powerful devices (aka phones).

## Credits

Carousel Demonstration based on [this example](https://medium.com/tinyso/how-to-create-the-responsive-and-swipeable-carousel-slider-component-in-react-99f433364aa0")  by Thin Tran.
    
Swiping provided by [john-doherty/swiped-events](https://github.com/john-doherty/swiped-events).

Deck of cards [by Дмитрий Фомин (Dmitry Fomin) on Wiki](https://en.wikipedia.org/wiki/File:Atlasnye_playing_cards_deck.svg.) 



