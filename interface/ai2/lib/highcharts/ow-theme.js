/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  The config for charts
 *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

Highcharts.theme = {
	colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572',
             '#FF9655', '#FFF263', '#6AF9C4'],
	chart: {
		spacing: [20, 10, 15, 10],
		backgroundColor: {
			linearGradient: {
				x1: 0,
				y1: 0,
				x2: 1,
				y2: 3
			},
			stops: [
				[0, 'var(--add5)'],
				[1, 'var(--add4)']
				]
			},
			borderWidth: 0,
			plotBackgroundColor: '#fff'
		},
		navigator: {
			maskFill: 'var(--modal)',
			xAxis: {labels: { style: { color: 'var(--sub5)'}}}
		},
		title: {
			style: {
				color: 'var(--sub5)',
				font: 'bold calc( 18px + 4 * (( 100vw - 300px) / ( var(--siteWidth) - 300 ))) "Red Rose", Verdana, sans-serif'
			}
		},
		xAxis: {
			labels: {
				style: {
					color: 'var(--sub5)'
				}
			},
			title: {
				style: {
					color: 'var(--sub5)'
				}
			}
		},
		yAxis: {
			labels: {
				style: {
					color: 'var(--sub5)'
				}
			},
			title: {
				style: {
					color: 'var(--sub5)'
				}
			}
		},
		legend: {
			itemStyle: {
				color: 'var(--sub5)'
			},
		labels: {
			style: {
				color: 'var(--sub5)'
			}
		},
		rangeSelector: {
			labelStyle: { color: 'var(--sub5)'}
		}
	}
}

Highcharts.setOptions(Highcharts.theme);
