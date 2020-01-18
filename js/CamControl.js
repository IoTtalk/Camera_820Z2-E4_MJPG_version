function CamControl(movetype, direction)
{
			var joystickcmd = "";
			if (movetype == "move")
			{
				switch(direction) {
					case 'up':
						//joystickcmd = "vx=0&vy=1";  //move continuously on mouse down and stop on mouse up
						joystickcmd = "move=up";  //move ~10 degree per click
						break;

					case 'down':
						//joystickcmd = "vx=0&vy=-1";
						joystickcmd = "move=down";
						break;

					case 'left':
						//joystickcmd = "vx=-1&vy=0";
						joystickcmd = "move=left";
						break;

					case 'right':
						//joystickcmd = "vx=1&vy=0";
						joystickcmd = "move=right";
						break;

					case 'stop':
						joystickcmd = "vx=0&vy=0";
						break;

					case 'home':
						joystickcmd = "move=home";
						break;

					default:
						break;
				}
				try {
					console.log("kerker");
					// parent.retframe.location.href='http://' + UNAME_IP_CAM + ':' + UWORD_IP_CAM + '@' + ADDR_IP_CAM + ':' + '/cgi-bin/com/ptz.cgi?' + joystickcmd;
					parent.retframe.location.href='http://' +  ADDR_IP_CAM + ':' + '/cgi-bin/com/ptz.cgi?' + joystickcmd;
				} 
				catch (err) {
					retframe.parent.retframe.location.href='http://' +  ADDR_IP_CAM + ':' + '/cgi-bin/com/ptz.cgi?' + joystickcmd;
				}
			}
			else if (movetype == "rzoom")
			{
				switch(direction) {
					case 'wide':
						//joystickcmd = "zooming=wide";  //zoom continuously on mouse down and stop on mouse up
						joystickcmd = "rzoom=-80";  //zoom per click
						break;

					case 'tele':
						//joystickcmd = "zooming=tele";
						joystickcmd = "rzoom=80";
						break;

					case 'stop':
						joystickcmd = "zoom=stop&zs=0";
						break;
				}
				try {
					parent.retframe.location.href='http://' +  ADDR_IP_CAM + ':' + '/cgi-bin/com/ptz.cgi?' + joystickcmd;
				}
				catch (err) {
					retframe.parent.retframe.location.href='http://' +  ADDR_IP_CAM + ':' + '/cgi-bin/com/ptz.cgi?' + joystickcmd;
				}
			}
			else if (movetype == "focus")
			{	
				switch(direction) {
					case 'near':
						joystickcmd = "focusing=near";
						break;

					case 'far':
						joystickcmd = "focusing=far";
						break;

					case 'auto':
						joystickcmd = "focus=auto";
						break;

					case 'stop':
						joystickcmd = "focusing=stop";
						break;
				}
				try {
					parent.retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
				catch (err) {
					retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?' + joystickcmd;
				}
			}
			else
			{
				try {
					parent.retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?'+ movetype +'='+ direction;
				}
				catch (err) {
					retframe.location.href='/cgi-bin/camctrl/camctrl.cgi?'+ movetype +'='+ direction;
				}
			}
}

/* 
 * PTZ Control
 */
/*preset*/
var tidSubmitPresetPre = null;
var waitSlideLatency = 500;
function SubmitPreset(selObj) 
{
	if ( isSpeedDome(capability_ptzenabled) == 1)
	{
        if (tidSubmitPresetPre != null) {
			clearTimeout(tidSubmitPresetPre);
		}
		tidSubmitPresetPre = setTimeout(function() {
				var CGICmd='/cgi-bin/camctrl/recall.cgi?recall=' + encodeURIComponent($(selObj).selectedOptions().text());
		$.ajaxSetup({ cache: false, async: true});
			$.get(CGICmd)
			Log("Send: %s",CGICmd);
		}, waitSlideLatency);
	}
	else if(capability_fisheye != 0)
	{
		for (var i=0; i < selObj.options.length-1; i++)
		{
			if (selObj.options[i].selected)
				break;
		}
	
		if (selObj.options[i].value == -1)
		{
			return;
		}
		
		var PresetPos = eval("eptz_c0_s" + streamsource + "_preset_i" + $(selObj).selectedOptions().val() + "_pos");
		document.getElementById(PLUGIN_ID).FishEyeGoPreset(
			parseInt(PresetPos.split(",")[0]), 
			parseInt(PresetPos.split(",")[1]), 
			parseInt(PresetPos.split(",")[2]), 
			parseInt(PresetPos.split(",")[3]), 
			parseInt(PresetPos.split(",")[4])
		);	
	}
	else if (isIZ(capability_ptzenabled) == 1)
	{
		var ChannelNo = 0;
		if (tidSubmitPresetPre != null) {
			clearTimeout(tidSubmitPresetPre);
		}
		tidSubmitPresetPre = setTimeout(function() {
			var CGICmd='/cgi-bin/camctrl/recall.cgi?channel=' + ChannelNo + '&recall=' + encodeURIComponent($(selObj).selectedOptions().text());
		$.ajaxSetup({ cache: false, async: true});
			$.get(CGICmd)
			Log("Send: %s",CGICmd);
		}, waitSlideLatency);
	}
	else
	{	
		var ChannelNo = 0;
		if (getCookie("activatedmode") == "mechanical")
		{
			var CGICmd='/cgi-bin/camctrl/recall.cgi?channel=' + ChannelNo + '&index=' + $(selObj).selectedOptions().val();
		}
		else
		{
			var CGICmd='/cgi-bin/camctrl/eRecall.cgi?stream=' + streamsource + '&recall=' + encodeURIComponent($(selObj).selectedOptions().text());
		}
		parent.retframe.location.href=CGICmd;
		// Show ZoomRatio after goto some presetlocation!
		var preset_num = $(selObj).selectedOptions().val();
		setTimeout("ShowPresetZoomRatio("+preset_num+")",1500);
		Log("Send: %s",CGICmd);
	}
}

function fGetPresetOptions()
{
	console.log("fGetPresetOptions");
}

/*sumit the recall command to Moves device to the preset position based on name.*/
function fSelectPreset()
{
	var presetName = $("#sel-preset option:selected").val();  //the text of the selected option
	$("#fSelectPreset").prop("method", "get");
	$("#fSelectPreset").prop("action", "http://" + ADDR_IP_CAM + ":" + PORT_IP_CAM_API + "/cgi-bin/gopreset.cgi");
	$('#fSelectPreset').append('<input id="tmpInputParameter" type="hidden" name="num" value="' + presetName + '" />'); 
	$('#fSelectPreset').submit();
	$("#tmpInputParameter").remove();  //remove the temp input element for passing the parameter.
}


function flogin() 
{
	var form = document.getElementById('login');
	form.submit();
}

function reloadImage(pThis)
{
	setTimeout( function ()
	{
		pThis.src = pThis.src;
	}, 3500);	
}

function toggleFullScreen(htmlId) {
  var doc = window.document;
  var elem = document.getElementById(htmlId); //the element you want to make fullscreen

  var requestFullScreen = elem.requestFullscreen || elem.webkitRequestFullScreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen|| doc.msExitFullscreen;

  if(!(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement)) {
      requestFullScreen.call(elem);
	  elem.style.backgroundColor = "black";
  }
  else {
    cancelFullScreen.call(doc);
	elem.style.backgroundColor = "";
  }
}

window.addEventListener('load', function(){
  document.getElementById("imageresource").addEventListener('click', function(){
	  toggleFullScreen("imageresource");
	  });  //toggleFullScreen when click the video 
})