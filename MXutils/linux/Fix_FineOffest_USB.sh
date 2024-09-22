#!/bin/bash

# Define the file path
RULES_FILE="/etc/udev/rules.d/50-usb-cmx.rules"

read -p "Please unplug the sttaions USB cable."


# Create the file and add the content
echo 'SUBSYSTEM=="input", GROUP="input", MODE="0666"' > $RULES_FILE
echo 'SUBSYSTEM=="usb", ATTRS{idVendor}=="1941", ATTRS{idProduct}=="8021", MODE:="0666", GROUP="plugdev"' >> $RULES_FILE
echo 'KERNEL=="hidraw*", ATTRS{idVendor}=="1941", ATTRS{idProduct}=="8021", MODE="0666", GROUP="plugdev"' >> $RULES_FILE

# Reload udev rules
sudo udevadm control --reload-rules

echo "Udev rules reloaded. Please plug the USB cable back in."
