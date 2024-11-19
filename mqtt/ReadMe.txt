!!! IMPORTANT !!!
—————————————————
Existing users please read below the section "Migrating from Cumulus MX versions prior to v3.28.0"



The template files
——————————————————
A number of sample templates are saved in this folder to give you a start on configuring your MQTT topics.

There are three options for sending MQTT data:

    1. Send a new message to the topic(s) whenever new data is received from your station.
        a. For this option, use the DataUpdateTemplate.txt file - see below...
        b. Save the template to a new filename, then add it to the Cumulus MX config at:
            Settings > MQTT Settings > Send messages on update

    2. Send a new message to the topics whenever the data has changed.
        a. For this option, use the DataUpdateTemplate.txt file - see below...
        b. Save the template to a new filename, then add it to the Cumulus MX config at:
            Settings > MQTT Settings > Send messages on update

    3. Send a new message to each topic, specifying a fixed interval for each topic.
        For this option:
        a. Use the IntervalTemplate.txt file
        b. Modify to your needs
            Note that for each topic you must specify the interval in seconds that it will be updated in the "interval" field
        c. Save the template to a new filename, then add it to the Cumulus MX config at:
            Settings > MQTT Settings > Send messages at fixed intervals

For options 1 and 2 use the DataUpdateTemplate.txt file. In that sample file you will find two topics defined.

    1. The first "CumulusMX/OnUpdate" sends a message every time the data is updated from your station

    2. The second "CumulusMX/OnUpdateChanged" sends a message only when the data for wind speed or direction changes
        - Note that in order to prevent fields like the time triggering the "on change", there is a property called "doNotTriggerOnTags". In the value for this
            property you specify the names of the web tags you want excluded from the "on change" checking.
        - If you do not have any fields that you want to prevent triggering the change, then you must still define the "doNotTriggerOnTags" property, but make its value an empty string.
            Like this: "doNotTriggerOnTags": ""



File Formats
————————————

Each MQTT configuration file is in JSON format and you must adhere to the rules for JSON when modifying the templates. The payload data for each topic
can  be in whatever format you like so long as you construct a valid string - i.e. escape quotation marks

The template files look something like this...
    {
        "topics": [
            {
                "topic": "CumulusMX/Interval",
                "data": "{\"time\":\"<#timehhmmss>\",\"temp\":<#temp rc=y>,\"humidity\":<#hum>,\"wgust\":<#wgust rc=y>}",
                "retain": false,
                "interval": 60
            }
        ]
    }

Where the topic name is "CumulusMX/Interval", and the payload is the string "{\"time\":\"<#timehhmmss>\",\"te ... rc=y>}" which is formatted as JSON text.

To create a template with multiple topics, use this format...
    {
        "topics": [
            {"topic": "MyName/Topic1", "data": "\"<#timehhmmss>\",<#temp rc=y>", "retain": false, "interval": 60},
            {"topic": "MyName/Topic2", "data": "<data><humidity><val><#hum></val></humidity></data>", "retain": true, "interval": 120}
        ]
    }

Where Topic1 is formatted as CSV, sent every 60 seconds, and is not retained on the server; Topic2 as formatted as XML, is retained, and is sent every 120 seconds

New lines, spacing etc are not important. The templates are indented and spaced to make them readable, but so long as the file retains a valid JSON syntax, whitespace is not important.



!!! IMPORTANT !!!

Migrating from Cumulus MX versions prior to v3.28.0
———————————————————————————————————————————————————

Cumulus MX v3.28 is a breaking change from previous versions. With the addition of ability to specify an update interval per topic, the old configuration of setting a fixed interval for
all topics in "Internet Settings > MQTT > Send messages at fixed intervals" has been removed.

If you used fixed interval updates prior to the v3.28.0, you must now edit your configuration file, and for each topic add the new property - "interval": NN - where NN is the update interval in seconds
if you do not do this, then the interval for those channels will default to 600 seconds

Note also that the MQTT settings have now moved out of Internet Settings and have their own configuration page.
