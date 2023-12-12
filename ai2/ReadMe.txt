Alternative Interface
=====================
ReadMe File
-----------
This update is to accommodate the changes made by Mark for CumulusMX Version 3.27.1 (build 3260).  It will NOT work with builds before this due to the significant changes Mark has made to the API calls.

GENERAL
-------

Dashboard, Current Readings, Gauges, Today V Yesterday, Additional Sensors & Airlink Sensors
All these pages now display todays date.

CHANGED
-------
Dashboard
~~~~~~~~~
The way that Alarms are displayed has changed due to changes made by Mark.  All LEDs are added to the page dynamically using line 383 in the dashboard.js file:

$('#alarms').append('<div class="led-block" style="order:0;"><div class="ow-led ow-brick" id="' + alarm.Id + '"></div>' + alarm.Name + '</div>');

If the alarm names spill over onto a new line than you can always change the name. (Mark forces them to have non-breaking spaces).  You can also change the class 'ow-brick' to any of: ow-brick, ow-oval, ow-lozenge, ow-round or leave it out completely; if you do leave it out you may wish to use the style ow-small (can be used with ow-round as well).

If you want to have different shapes then this can be done by using some decision making code based on the alarm.Notify or alarm.Email fields.  If you do this then you also have the opportunity to change the 'order' style to change the order in which the alarms are displayed.

Current Readings
~~~~~~~~~~~~~~~~
As well as Font Awsome icons, Outdoor Temperature and Pressure show an indicatior for rising, falling or static; Rainfall Rate also shows an indicator for the severity of the rate: one, two or three raindrops.  If it is not raining the image is a raindrop with a green cross.

Also included on this page is a green icon if the readings are still being recieved.

Gauges
~~~~~~
The gauges page includes the forcast scroller used on the default public website.  If you don't want it simply add the style 'w3-hide' to line 205 of the ai-gauges.html page.

Charts
~~~~~~
You can change the placement of the buttons, the chart and the information text simply by adding a style 'order:x' to lines 92, 114 and 116.  Replace 'x' with a number and the separate elemenets will appear in numeric order.  This has already been done on the Select-a-Chart & Select-a-Period page.  You can use the same principle for all the buttons: just add an order number style.  You can also just add a max-width style to the buttons to limit the size they grow to if you want.

The Historic charts page display yesterdays date as the most recent date for data to be available.

Today Vs Yesterday
~~~~~~~~~~~~~~~~~~
The temperature column for yesterday also includes the date yesterday.  I haven't extended this to other panels but by looking at the code it should not be difficult for you to do.  I didn't know if it would be best to just have the date or the word as well - it's up to you.  Todays date could also be used in the 'today' column by adding '<span data-OWData="Date"></span>' but note that this used the long month name. (This can also be ammended at the bottom of the 'ai-extra.js' file).

Monthly Records
~~~~~~~~~~~~~~~
The first time you load the Monthly Records Editor it will load the month you first started your weather station records.  Otherwise it will load the last month you viewed in the current session.

If your station is new and you don't have records for all months, the missing months buttons will be removed.  If you don't want this, you can edit the records.js file and remove the function beginning at line 101.

If you want the bottons in a differnt order, e.g., you want the 'All-time', 'This Month' & 'This Year' buttons together give them the style: 'order:-1' to put them at the start or 'order:1' to put them at the end.

Extra Sensors & Airlink Sensors
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Each panel is part of a flex box so you can change their order just by changing the 'order:x' style.

Data Log Editors
~~~~~~~~~~~~~~~~
These now automatically collect the correct units for your station.  You have to manually load the data for the selected period in the Data Log Viewer.

Setting
=======
IMPORTANT
---------
If you try to edit the 'Internet Settings ~ Web/Upload Site ~ General Settings / Advanced Settings you will find that the panels DO NOT OPEN.  I have been unable to correct this.  Further more, if you make ANY changes on this page YOU ARE STRONGLY ADVISED TO CHECK ALL SETTINGS for this page on the DEFAULT INTERFACE.

If you use 'MySQL Settings ~ Custom Upload - Timed'  You MAY find that the Interval checkbox stays checked.  If this is OK by you then it will work.  However, if your custom upload is a one-off daily event you should check using the default Interface.


Animations
----------
The AI Configure page only affects animations for the seagull image on the right.  However, animations can also be applied to just about any other element.

Some pages have been left with animations applied to the cards. It is up to you to decide if you want them at all or if you want to change them.

The available animation classes available are:
ow-animate-drop		- This expands down over 1 second
ow-animate-fadeIn	- This fades the element in over 2 seconds
The timings can be adjusted in the css file lines 347 & 358 but be aware that the drop animation is used for the menus so changes will affect them as well.  By all means add more and experiment if you want.

FontAwsome
~~~~~~~~~~
You now have access to FontAwsome icons (free) throughout the site.  To use, visit the FontAwsome website to find the available icons.  This site enables you to copy the html code needed for the selected icon.  Just paste this wherever you want.  Please note you only have access to the FREE icons unless you purchase a license.
