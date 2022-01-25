# Overview of features

This document gives an overview of all the features. This serves as a checklist to see if there are any breaking changes in lieu of actual integration or unit tests.

## Start up
On start up the application will show
    * x number of cards where x is defined as by the maxCards="3" attribute in the "card-container" div.
    * Indicators underneath the cards, one per card with the current active card highlighted.
    * A refresh and lock button.
    * Some text displaying the platform settings

## Browsing
The user can browse through the cards by
    * (PC) press left or right arrow
    * (Mobile) Swipe left or right

Whereas normally cards are rotated away and positioned differently from the 'center' card. The center card itself is displayed in full without rotation and slightly hightlighted. 

## Switching between orientation