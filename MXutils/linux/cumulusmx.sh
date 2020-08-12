#!/bin/sh

# Place this file in /etc/init.d/
# chmod 0755 /etc/init.d/cumulusmx.sh

CMXPATH=/usr/share/CumulusMX

daemon_name=CumulusMX

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/bin/mono/mono-service
NAME=CumulusMX
DESC='Cumulus MX Service'


if [ -f /etc/rc.status ]; then
    . /etc/rc.status
    rc_reset
fi

if [ -f /etc/rc.d/init.d/functions ]; then
    . /etc/rc.d/init.d/functions
fi

LOCKFILE=/tmp/cmx.pid
MONOSERVER=$(which mono-service)
if [ -f ${LOCKFILE} ]; then
    MONOSERVER_PID=$(cat ${LOCKFILE})
else
    MONOSERVER_PID=
fi

case "$1" in
    start)
        echo "Starting Cumulus MX"
        if [ -z "${MONOSERVER_PID}" ]; then
            ${MONOSERVER} -l:${LOCKFILE} -d:${CMXPATH} ${CMXPATH}/CumulusMX.exe -service
        else
            echo "Cumulus MX is already running!"
            exit 1
        fi
    ;;
    stop)
        echo "Stopping Cumulus MX"
        if [ -n "${MONOSERVER_PID}" ]; then
            kill ${MONOSERVER_PID}
            rm ${LOCKFILE}
        else
            echo "Cumulus MX is not running"
            exit 1
        fi
    ;;
    restart)
        $0 stop
        sleep 10
        $0 start
    ;;
    status)
        echo
        if [ -z "${MONOSERVER_PID}" ]; then
            echo "Cumulus MX is not running"
        else
            echo "Cumulus MX is running"
        fi
        echo
        echo "Last console output..."
        echo
        if [ -f ${CMXPATH}/MXdiags/ServiceConsoleLog.txt ]; then
            echo "$(cat ${CMXPATH}/MXdiags/ServiceConsoleLog.txt)"
        else
            echo "** No console output logged **"
        fi
        echo
    ;;
    removelock)
        echo "Removing Cumulus MX service lock file"
        rm ${LOCKFILE}
        echo "Lock file removed"
    ;;
    *)
        echo
        echo "usage: $0 {start|stop|restart|status|removelock}"
esac

exit 0
