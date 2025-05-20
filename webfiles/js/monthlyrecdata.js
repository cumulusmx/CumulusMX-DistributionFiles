// Last modified: 2025/05/20 16:10:57

$(document).ready(function() {
	dataLoadedPromise.then(function() {
		var yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		changeData(yesterday.getMonth());
		$('#btnMon' + yesterday.getMonth()).attr('aria-pressed', true);
	});
});

var monthnames = new Array("January","February","March","April","May","June","July","August","September","October","November","December");

function changeData(month) {
	document.getElementById('MonthName').innerHTML = monthnames[month];
	document.getElementById('TempH').innerHTML = cmx_data.monthlyrecs.hightemp[month];
	document.getElementById('TempHT').innerHTML = cmx_data.monthlyrecs.hightempT[month];
	document.getElementById('TempL').innerHTML = cmx_data.monthlyrecs.lowtemp[month];
	document.getElementById('TempLT').innerHTML = cmx_data.monthlyrecs.lowtempT[month];
	document.getElementById('DewPointH').innerHTML = cmx_data.monthlyrecs.highDP[month];
	document.getElementById('DewPointHT').innerHTML = cmx_data.monthlyrecs.highDPT[month];
	document.getElementById('DewPointL').innerHTML = cmx_data.monthlyrecs.lowDP[month];
	document.getElementById('DewPointLT').innerHTML = cmx_data.monthlyrecs.lowDPT[month];
	document.getElementById('AppTempH').innerHTML = cmx_data.monthlyrecs.highapptemp[month];
	document.getElementById('AppTempHT').innerHTML = cmx_data.monthlyrecs.highapptempT[month];
	document.getElementById('AppTempL').innerHTML = cmx_data.monthlyrecs.lowapptemp[month];
	document.getElementById('AppTempLT').innerHTML = cmx_data.monthlyrecs.lowapptempT[month];
	document.getElementById('FeelsLikeH').innerHTML = cmx_data.monthlyrecs.highfeelslike[month];
	document.getElementById('FeelsLikeHT').innerHTML = cmx_data.monthlyrecs.highfeelslikeT[month];
	document.getElementById('FeelsLikeL').innerHTML = cmx_data.monthlyrecs.lowfeelslike[month];
	document.getElementById('FeelsLikeLT').innerHTML = cmx_data.monthlyrecs.lowfeelslikeT[month];
	document.getElementById('WChillL').innerHTML = cmx_data.monthlyrecs.lowchill[month];
	document.getElementById('WChillLT').innerHTML = cmx_data.monthlyrecs.lowchillT[month];
	document.getElementById('HeatIndexH').innerHTML = cmx_data.monthlyrecs.highheatindex[month];
	document.getElementById('HeatIndexHT').innerHTML = cmx_data.monthlyrecs.highheatindexT[month];
	document.getElementById('MinTempH').innerHTML = cmx_data.monthlyrecs.highmintemp[month];
	document.getElementById('MinTempHT').innerHTML = cmx_data.monthlyrecs.highmintempT[month];
	document.getElementById('MaxTempL').innerHTML = cmx_data.monthlyrecs.lowmaxtemp[month];
	document.getElementById('MaxTempLT').innerHTML = cmx_data.monthlyrecs.lowmaxtempT[month];
	document.getElementById('HumH').innerHTML = cmx_data.monthlyrecs.highhum[month];
	document.getElementById('HumHT').innerHTML = cmx_data.monthlyrecs.highhumT[month];
	document.getElementById('HumL').innerHTML = cmx_data.monthlyrecs.lowhum[month];
	document.getElementById('HumLT').innerHTML = cmx_data.monthlyrecs.lowhumT[month];
	document.getElementById('HighDailyTempRange').innerHTML = cmx_data.monthlyrecs.hightemprange[month];
	document.getElementById('HighDailyTempRangeT').innerHTML = cmx_data.monthlyrecs.hightemprangeT[month];
	document.getElementById('LowDailyTempRange').innerHTML = cmx_data.monthlyrecs.lowtemprange[month];
	document.getElementById('LowDailyTempRangeT').innerHTML = cmx_data.monthlyrecs.lowtemprangeT[month];
	document.getElementById('RainRateH').innerHTML = cmx_data.monthlyrecs.rainrate[month];
	document.getElementById('RainRateHT').innerHTML = cmx_data.monthlyrecs.rainrateT[month];
	document.getElementById('HourlyRainH').innerHTML = cmx_data.monthlyrecs.hourlyrain[month];
	document.getElementById('HourlyRainHT').innerHTML = cmx_data.monthlyrecs.hourlyrainT[month];
	document.getElementById('Rain24HourH').innerHTML = cmx_data.monthlyrecs.rain24h[month];
	document.getElementById('Rain24HourHT').innerHTML = cmx_data.monthlyrecs.rain24hT[month];
	document.getElementById('DailyRainH').innerHTML = cmx_data.monthlyrecs.dailyrain[month];
	document.getElementById('DailyRainHT').innerHTML = cmx_data.monthlyrecs.dailyrainT[month];
	document.getElementById('MonthlyRainH').innerHTML = cmx_data.monthlyrecs.monthlyrain[month];
	document.getElementById('MonthlyRainHT').innerHTML = cmx_data.monthlyrecs.monthlyrainT[month];
	document.getElementById('LongestDryPeriod').innerHTML = cmx_data.monthlyrecs.dryperiod[month];
	document.getElementById('LongestDryPeriodT').innerHTML = cmx_data.monthlyrecs.dryperiodT[month];
	document.getElementById('LongestWetPeriod').innerHTML = cmx_data.monthlyrecs.wetperiod[month];
	document.getElementById('LongestWetPeriodT').innerHTML = cmx_data.monthlyrecs.wetperiodT[month];
	document.getElementById('MostDryDays').innerHTML = cmx_data.monthlyrecs.dryDays[month];
	document.getElementById('MostDryDaysT').innerHTML = cmx_data.monthlyrecs.dryDaysT[month];
	document.getElementById('MostRainDays').innerHTML = cmx_data.monthlyrecs.wetDays[month];
	document.getElementById('MostRainDaysT').innerHTML = cmx_data.monthlyrecs.wetDaysT[month];
	document.getElementById('GustH').innerHTML = cmx_data.monthlyrecs.highgust[month];
	document.getElementById('GustHT').innerHTML = cmx_data.monthlyrecs.highgustT[month];
	document.getElementById('WindH').innerHTML = cmx_data.monthlyrecs.highwind[month];
	document.getElementById('WindHT').innerHTML = cmx_data.monthlyrecs.highwindT[month];
	document.getElementById('WindRunH').innerHTML = cmx_data.monthlyrecs.highwindrun[month];
	document.getElementById('WindRunHT').innerHTML = cmx_data.monthlyrecs.highwindrunT[month];
	document.getElementById('PressL').innerHTML = cmx_data.monthlyrecs.lowpress[month];
	document.getElementById('PressLT').innerHTML = cmx_data.monthlyrecs.lowpressT[month];
	document.getElementById('PressH').innerHTML = cmx_data.monthlyrecs.highpress[month];
	document.getElementById('PressHT').innerHTML = cmx_data.monthlyrecs.highpressT[month];
	$('#btnArray').children('button').attr("aria-pressed", false);
	$('#btnMon' + month).attr('aria-pressed', true);
}
