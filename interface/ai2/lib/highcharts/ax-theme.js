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
				x2: 0,
				y2: 1
			},
			stops: [
				[0, 'var(--color3)'],
				[0.83, 'var(--color5)'],
				[0.85, 'var(--color1'],
				[1, 'var(--color3)']
				]
			},
			borderWidth: 0,
			plotBackgroundColor: '#fff'
		},
		navigator: {
			maskFill: 'var(--modal)',
			margin: 30,
			handles: {
				backgroundColor: 'var(--color7)',
				borderColor: 'var(--color1)'
			},
			outlineColor: 'var(--color5)',
			xAxis: {
				labels: { 
					y: -45,
					align:'center',
					style: { color: 'var(--color7)'}
				}
			}
		},
		title: {
			style: {
				color: 'var(--color9)',
				font: 'bold calc( 18px + 4 * (( 100vw - 300px) / ( var(--siteWidth) - 300 ))) "Red Rose", Verdana, sans-serif'
			}
		},
		xAxis: {
			labels: {
				style: {
					color: 'var(--color9)'
				}
			},
			title: {
				style: {
					color: 'var(--color9)'
				}
			}
		},
		yAxis: {
			labels: {
				style: {
					color: 'var(--color9)'
				}
			},
			title: {
				style: {
					color: 'var(--color9)'
				}
			}
		},
		legend: {
			itemStyle: {
				color: 'var(--color9)'
			},
		labels: {
			style: {
				color: 'var(--color9)'
			}
		},
		rangeSelector: {
			labelStyle: { color: 'var(--color9)'}
		}
	}
}

Highcharts.setOptions(Highcharts.theme);
