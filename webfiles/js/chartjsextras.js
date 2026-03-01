// Helper plugins and useful functions for ChartJS
// Last updated: 2026/02/28 12:25:02

const CmxChartJsPlugins = {

    navigatorPlugin: {
        id: 'navigatorSelection',
        afterDraw(chart) {
            const { ctx, chartArea, scales } = chart;
            const xScale = scales.x;
            // constrain x1 and x2 to be within the plot area
            const x1 = Math.max(xScale.getPixelForValue(selection.start), chartArea.left);
            const x2 = Math.max(Math.min(xScale.getPixelForValue(selection.end), chartArea.right), chartArea.left);
            const y1 = chartArea.top;

            const handle = (x) => {
                const midPoint = chartArea.height / 2;
                ctx.save();
                // the rectangle
                ctx.beginPath();
                ctx.strokeStyle = 'grey';
                ctx.fillStyle = 'white';
                ctx.lineWidth = 1;
                ctx.fillRect(x - 4, midPoint - 8, 8, 16);
                ctx.strokeRect(x - 4, midPoint - 8, 8, 16);

                // the lines
                ctx.beginPath();
                ctx.strokeStyle = 'grey';
                ctx.lineWidth = 1;
                ctx.moveTo(x + 1.5, midPoint - 5);
                ctx.lineTo(x + 1.5, midPoint + 5);
                ctx.moveTo(x - 1.5, midPoint - 5);
                ctx.lineTo(x - 1.5, midPoint + 5);
                ctx.stroke();
                ctx.restore();
            };

            // Draw selection box
            ctx.save();
            ctx.fillStyle = 'rgba(66,133,244,0.12)';
            ctx.strokeStyle = 'rgba(66,133,244,0.35)';
            ctx.lineWidth = 1;
            ctx.fillRect(x1, y1, x2 - x1, chartArea.height);
            ctx.strokeRect(x1, y1, x2 - x1, chartArea.height);

            // Draw start-end borders
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4);';
            ctx.fillRect(x1 - 1, y1, 2, chartArea.height);
            ctx.fillRect(x2 - 1, y1, 2, chartArea.height);

            // Draw tooltip if dragging
            /*
            if (dragging) {
                const midX = (x1 + x2) / 2;
                const startStr = luxon.DateTime.fromMillis(selection.start).toFormat('HH:mm');
                const endStr = luxon.DateTime.fromMillis(selection.end).toFormat('HH:mm');
                const rangeStr = `${startStr} – ${endStr}`;

                ctx.font = '11px sans-serif';
                const textWidth = ctx.measureText(rangeStr).width;
                const padding = 6;
                const boxWidth = textWidth + padding * 2;
                const boxHeight = 20;

                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(midX - boxWidth / 2, (y2 - y1) / 2 - boxHeight / 2, boxWidth, boxHeight);
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(rangeStr, midX, (y2 - y1) / 2);
            }
            */

            ctx.restore();

            // Draw the selection handles
            handle(x1);
            handle(x2);
        }
    },

    // Plugin to draw border around chart area
    chartAreaBorder: {
      id: 'chartAreaBorder',
      beforeDraw(chart, args, options) {
        const {ctx, chartArea: {left, top, width, height}} = chart;
        ctx.save();
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = options.borderWidth;
        ctx.setLineDash(options.borderDash || []);
        ctx.lineDashOffset = options.borderDashOffset;
        ctx.strokeRect(left, top, width, height);
        ctx.restore();
      }
    },

    // Charts.js plugin to hide unused y-axes
    hideUnusedAxesPlugin: {
        id: 'hideUnusedAxes',
        beforeUpdate(chart) {
            const visibleYAxes = new Set();

            chart.data.datasets.forEach(ds => {
                if (chart.isDatasetVisible(ds.index ?? chart.data.datasets.indexOf(ds))) {
                    visibleYAxes.add(ds.yAxisID || 'y');
                }
            });

            Object.entries(chart.options.scales).forEach(([axisId, axis]) => {
                if (axisId.startsWith('y')) {
                    axis.display = visibleYAxes.has(axisId);
                }
            });
        }
    }
};

const CmxChartJsHelpers = {

    ToggleFullscreen: elem => {
        elem = elem || document.documentElement;
        const mainContainer = document.getElementById('mainChartContainer');
        const navContainer = document.getElementById('navChartContainer');

        if (document.fullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        } else {
            mainContainer.setAttribute('data-height', mainContainer.offsetHeight);
            mainContainer.style.height = '85%';
            navContainer.style.height = '12%';

            if (elem.requestFullscreen) {
                elem.requestFullscreen()
                .catch((err) => console.error(err));
            }
        }
    },

    FullScreenEventHandler: (e) => {
        if (document.fullscreenElement) {
            document.getElementById('btnFullscreen').textContent = 'Exit fullscreen';
        } else {
            const mainContainer = document.getElementById('mainChartContainer');
            const navContainer = document.getElementById('navChartContainer');
            mainContainer.style.visibility = 'hidden';
            navContainer.style.visibility = 'hidden';
            navContainer.style.height = null
            document.getElementById('mainChart').style.height = mainContainer.getAttribute('data-height') + 'px';
            mainContainer.style.height = mainContainer.getAttribute('data-height') + 'px';
            document.getElementById('btnFullscreen').textContent = 'Fullscreen';

            setTimeout(() => {
                mainChart.update('none');
                navChart.update('none');
                mainContainer.style.visibility = null;
                navContainer.style.visibility = null;
                mainContainer.style.height = null;
            }, 500);
        }
    },

    SetRangeButtons: (id, definitions) => {
        const container = $('#' + id);

        container.text('Zoom:');

        for (const def of definitions) {
            let button = $('<button>')
            .attr('data-count', def.count ?? 0)
            .attr('data-type', def.type)
            .text(def.text);
            container.append(button);
        }
    },

    SetInitialRange: (data) => {
        if (data == null || data.length === 0) return;
        const type = myRangeBtns.buttons[myRangeBtns.selected].type;
        const defaultEnd = data[data.length - 1][0];
        const min = data[0][0];
        let defaultStart;
        const endDate = new Date(defaultEnd);
        const count = myRangeBtns.buttons[myRangeBtns.selected].count ?? 0;

        if (type === 'all') {
            defaultStart = min;
        } else if (type === 'hour') {
            defaultStart = defaultEnd - count * 60 * 60 * 1000;
        } else if (type  === 'day') {
            defaultStart = endDate.setDate(endDate.getDate() - count);
        } else if (type === 'month') {
            defaultStart = endDate.setMonth(endDate.getMonth() - count);
        } else if (type === 'ytd') {
            let start = new Date(endDate.getFullYear, 0, 1);
            defaultStart = start.getTime();
        }

        selection = {
            start: Math.max(min, defaultStart),
            end: defaultEnd
        };
    },

    SetupNavigatorSelection: navchart => {
        const navChartElem = document.getElementById(navchart);

        let lastNavOffsetX = null;
        let rafPending = false;

        const updateChartsFromEvent = (x) => {
            if (navChart.scales == null || navChart.scales.x == null) return;

            const canvas = navChart.canvas;
            const xScale = navChart.scales.x;
            const pxStart = xScale.getPixelForValue(selection.start);
            const pxEnd = xScale.getPixelForValue(selection.end);
            const handlePxThreshold = 4;

            let newCursor = 'default';
            if (Math.abs(x - pxStart) < handlePxThreshold || Math.abs(x - pxEnd) < handlePxThreshold) {
                newCursor = 'col-resize';
            } else if (x > pxStart && x < pxEnd) {
                newCursor = 'grab';
            }

            // Only update if changed
            if (newCursor !== currentCursor) {
                canvas.style.cursor = newCursor;
                currentCursor = newCursor;
            }

            if (!dragging) {
                return;
            }

            const dx = x - dragStartX;
            const dt = dx / (xScale.right - xScale.left) * (xScale.max - xScale.min);
            const max = xScale.max, min = xScale.min;
            // convert minimum width in pixels to ms
            const minWidthPx = 10;
            const minWidthMs = minWidthPx / (xScale.right - xScale.left) * (xScale.max - xScale.min);

            if (dragging === 'start') {
                selection.start += dt;
                if (selection.start >= selection.end) {
                    selection.start = selection.end - 1;
                }
                if (selection.start < min) {
                    const d = min - selection.start;
                    selection.start += d;
                }
                if (selection.end - selection.start < minWidthMs) {
                    selection.start = selection.end - minWidthMs;
                }
            } else if (dragging === 'end') {
                selection.end += dt;
                if (selection.end <= selection.start) {
                    selection.end = selection.start + 1;
                }
                if (selection.end > max) {
                    const d = selection.end - max;
                    selection.end -= d;
                }
                if (selection.end - selection.start < minWidthMs) {
                    selection.end = selection.start + minWidthMs;
                }
            } else if (dragging === 'drag') {
                selection.start += dt;
                selection.end += dt;

                if (selection.start < min) {
                    const d = min - selection.start;
                    selection.start += d;
                    selection.end += d;
                }
                if (selection.end > max) {
                    const d = selection.end - max;
                    selection.start -= d;
                    selection.end -= d;
                }
            }

            dragStartX = x;
            navChart.update('none');
            mainChart.options.scales.x.min = selection.start;
            mainChart.options.scales.x.max = selection.end;
            mainChart.update('none');
        };

        navChartElem.addEventListener('pointerdown', (e) => {
            if (navChart.scales == null || navChart.scales.x == null) return;

            const x = e.offsetX;
            const xScale = navChart.scales.x;
            const pxStart = xScale.getPixelForValue(selection.start);
            const pxEnd = xScale.getPixelForValue(selection.end);
            const handleThreshold = 6; // handle width is 8px (+-4px from center), so threshold is 4px + some padding

            if (Math.abs(x - pxStart) < handleThreshold) {
                dragging = 'start';
            } else if (Math.abs(x - pxEnd) < handleThreshold) {
                dragging = 'end';
            } else if (x > Math.min(pxStart, pxEnd) && x < Math.max(pxStart, pxEnd)) {
                dragging = 'drag';
            } else {
                dragging = 'move';
            }

            dragStartX = x;
        });

        navChartElem.addEventListener('pointermove', (e) => {
            lastNavOffsetX = e.offsetX;

            if (dragging != null && !rafPending) {
                rafPending = true;
                requestAnimationFrame(() => {
                    rafPending = false;
                    updateChartsFromEvent(lastNavOffsetX);
                });
            }
        });

        window.addEventListener('pointerup', (e) => {
            if (dragging =='move') {
                // if click outside the selector, shift the whole selector by the width of the selector, in the direction of the click
                if (navChart.scales == null || navChart.scales.x == null) return;

                const x = e.offsetX;
                const xScale = navChart.scales.x;
                const pxStart = xScale.getPixelForValue(selection.start);
                const pxEnd = xScale.getPixelForValue(selection.end);
                const selectorWidth = selection.end - selection.start;

                if (x < pxStart) {
                    // Shift left
                    selection.start -= selectorWidth;
                    selection.end -= selectorWidth;
                    if (selection.start < xScale.min) {
                        selection.start = xScale.min;
                        selection.end = selection.start + selectorWidth;
                    }
                } else if (x > pxEnd) {
                    // Shift right
                    selection.start += selectorWidth;
                    selection.end += selectorWidth;
                    if (selection.end > xScale.max) {
                        selection.end = xScale.max;
                        selection.start = selection.end - selectorWidth;
                    }
                }

                navChart.update('none');
                mainChart.options.scales.x.min = selection.start;
                mainChart.options.scales.x.max = selection.end;
                mainChart.update('none');

            } else if (currentCursor !== 'default') {
                currentCursor = 'default';
                document.getElementById('navChart').style.cursor = currentCursor;
                if (navChart) {
                    try {
                        navChart.update('none'); // Force redraw to remove tooltip
                    } catch {}
                }
            } else {
                // we were dragging, ensure final position is updated
                lastNavOffsetX = e.offsetX;
                updateChartsFromEvent(lastNavOffsetX); // final update
            }

            dragging = null;
        });

        document.querySelectorAll('#rangeButtons button').forEach(btn => {
            btn.addEventListener('click', () => {
                if (navChart.data.datasets == null || navChart.data.datasets.length == 0 ||
                    mainChart.data.datasets == null ||  mainChart.data.datasets.length == 0
                ) return;

                // helper to determine data format
                // bar charts use data as [{x:ts,y:val}]
                // all other charts use data as [[ts,val]]
                const isArrayFormat = (datum) => {
                    return Array.isArray(datum) && datum.length === 2 &&
                        typeof datum[0] === 'number' && typeof datum[1] === 'number';
                };

                let fullStart, fullEnd;
                const firstDataSeries = mainChart.data.datasets[0].data;

                if (isArrayFormat(mainChart.data.datasets[0].data[0])) {
                    fullStart = firstDataSeries[0][0] ?? firstDataSeries[0].x;
                    fullEnd = firstDataSeries[firstDataSeries.length - 1][0] ?? firstDataSeries[firstDataSeries.length - 1].x;
                } else {
                    fullStart = firstDataSeries[0][0] ?? firstDataSeries[0].x;
                    fullEnd = firstDataSeries[firstDataSeries.length - 1][0] ?? firstDataSeries[firstDataSeries.length - 1].x;
                }

                const fullRange = fullEnd - fullStart;

                const selMid = (selection.start + selection.end) / 2;

                const relStart = (selection.start - fullStart + 1) / fullRange;
                const relEnd = (fullEnd - selection.end + 1) / fullRange;

                const count = parseInt(btn.dataset.count);
                const type = btn.dataset.type;

                let newStart, newEnd;
                const endDate = new Date(fullEnd);

                if (type === 'all') {
                    newStart = fullStart;
                    newEnd = fullEnd;
                } else if (type === 'ytd') {
                    let start = new Date(endDate.getFullYear(), 0, 1);
                    newStart = Math.max(fullStart, start.getTime());
                    newEnd = fullEnd;
                } else {
                    let newRangeMs;

                    if (type === 'hour') {
                        newRangeMs = count * 60 * 60 * 1000;
                    } else if (type  === 'day') {
                        newRangeMs = endDate.getTime() - endDate.setDate(endDate.getDate() - count);
                    } else if (type === 'month') {
                        newRangeMs = endDate.getTime() - endDate.setMonth(endDate.getMonth() - count);
                    } else if (type === 'year') {
                        newRangeMs = endDate.getTime() - endDate.setYear(endDate.getFullYear() - count);
                    }

                    if (relEnd < 0.01) {
                        // Near end
                        newEnd = fullEnd;
                        newStart = fullEnd - newRangeMs;
                    } else if (relStart < 0.01) {
                        // Near start
                        newStart = fullStart;
                        newEnd = fullStart + newRangeMs;
                    } else {
                        // Centered
                        newStart = selMid - newRangeMs / 2;
                        newEnd = selMid + newRangeMs / 2;
                    }

                    // Clamp if out of bounds
                    if (newStart < fullStart) {
                        newStart = fullStart;
                        newEnd = Math.min(fullEnd, fullStart + newRangeMs);
                    }
                    if (newEnd > fullEnd) {
                        newEnd = fullEnd;
                        newStart = Math.max(fullStart, fullEnd - newRangeMs);
                    }
                }

                selection.start = newStart;
                selection.end = newEnd;

                // Update charts
                navChart.update('none');
                mainChart.options.scales.x.min = newStart;
                mainChart.options.scales.x.max = newEnd;
                mainChart.update('none');
            });
        });
    },

    ShowLoading: () => {
        if (document.getElementById('spinnerContainer')) {
            return;
        }

        const chartCont = document.getElementById('chartcontainer');
        const newCont = document.createElement('div');
        newCont.id = 'spinnerContainer';
        newCont.className = 'spinner-container';
        const newSpin = document.createElement('div');
        newSpin.className = 'spinner'
        newCont.append(newSpin);
        chartCont.insertBefore(newCont, chartCont.firstChild);
    },

    HideLoading: () => {
        try {
            document.getElementById('spinnerContainer').remove();
        } catch {}
    },

    AddPrintButtonHandler: (buttonId, chartId) => {
        document.getElementById('btnPrint').addEventListener('click', () => {
            const canv = document.getElementById('mainChart');
            const imgUrl = canv.toDataURL('image/png', 1.0);
            const win = window.open('', '', `left=0,top=0,width=${canv.width},height=${canv.height},menubar=0,toolbar=0,scrollbars=0,status=0`);
            win.resizeTo(canv.width, canv.height);
            const winContent = `<!DOCTYPE html><html><head><title>Print canvas</title></head><body><img src="${imgUrl}"></body>`;
            win.document.write(winContent);
            win.onafterprint = () => { win.close() };
            setTimeout(() => { win.print(); }, 500);
        });
    },

    NavChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                ticks: {
                    major: {
                        enabled: true
                    },
                    font: context => {
                        if (context.tick && context.tick.major) {
                            return {
                                weight: 'bold'
                            };
                        }
                    }
                },
                grace: 0
            },
            y: {
                display: false,
                grace: 0
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            chartAreaBorder: {
                borderColor: 'rgba(0,0,0,0.4)',
                borderWidth: 1
            },
            decimation: { enabled: true}
        },
        events: ['pointerdown', 'pointermove', 'pointerup']
    },

    TimeScale: {
        type: 'time',
        ticks: {
            major: {
                enabled: true
            },
            font: context => {
                if (context.tick && context.tick.major) {
                    return {
                        weight: 'bold'
                    };
                }
            }
        },
        grace: 0
    },

    TimeScaleDaily: {
        type: 'time',
        ticks: {
            major: {
                enabled: true
            },
            font: context => {
                if (context.tick && context.tick.major) {
                    return {
                        weight: 'bold'
                    };
                }
            }
        },
        time: {
            minUnit: 'day'
        },
        grace: 0
    }
};

document.addEventListener("fullscreenchange", CmxChartJsHelpers.FullScreenEventHandler);
