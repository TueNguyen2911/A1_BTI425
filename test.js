
function getTime(time, timezone) {
    time = time + timezone; 
    let date = new Date(time*1000);
    date = date.toUTCString().slice(17,26);
    if(parseInt(date.slice(0,2)) > 12)
        date = "0" + (parseInt(date.slice(0,2))%12).toString().concat(date.slice(2)) + "PM";
    else 
        date += "AM";
    console.log(date);
}
getTime(1612003525, 25200);