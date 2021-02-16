/******************************************************************************
***
* BTI425 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Tue Nguyen  Student ID: 108154196 Date: 29-01-2021
*
*
******************************************************************************
**/ 
$(document).ready(function() {
    var keyword, city, country = "";
    var api_url = "";
    
    $("#search_icon").on("click", function() {
        keyword = $(".search").val();
        keyword.replace(/\s/g, '');
        $('#weather_body').empty();
        $('#pagination-wrapper').empty();
        $('.errorMessage').empty();
        if(keyword == "")
            $(".errorMessage").append("Search keyword must not be empty");
        else {
            $.ajax({
                async: false,
                type: "GET",
                dataType: "json",
                url: "city.list.json",
                success: function(data) {
                    if(keyword.indexOf(',') > 0) {
                        city = keyword.slice(0, keyword.indexOf(','));
                        country = keyword.slice(city.length + 1);
                        $.each(data, function(index, value) {
                            if(country == value.country && city == value.name)
                                api_url = "http://api.openweathermap.org/data/2.5/weather?id=" + value.id + "&appid=1c4993f81daae9d4eaf06858adea5d31&units=metric"
                        });
                    }
                    else {
                        let cities = [];
                        city = keyword.slice(0);

                        $.each(data, function(index, value) {
                            if(value.name == city) {
                                let id = value.id;
                                let code = value.country;
                                cities.push({id,code});
                            }
                        });
                        api_url = "http://api.openweathermap.org/data/2.5/group?id=";
    
                        $.each(cities, function(index, value) {
                            api_url += value.id; 
                            index < cities.length - 1 ? api_url += "," : api_url += "";
                        })
                        api_url += "&appid=1c4993f81daae9d4eaf06858adea5d31&units=metric";
                    }
                }
            })
        }
        var state = {
            'dataSet': "",
            'page': 1,
            'rows': 3,
        }
        $.ajax({
            type: "GET",
            dataType: "json",
            url: api_url,
            success: function(data) {
                console.log("api_url scc:" + api_url);
                if(data.list) {
                    state.dataSet = data.list;
                    buildTable();
                }
                else {
                    let flag;
                    $.ajax({
                        async: false,
                        url: 'https://restcountries.eu/rest/v2/alpha/' + data.sys.country,
                        success: function(result) {
                            flag = result.flag;
                        }
                    });
                    var row = '<tr> <td>';
                    row += '<img src=' + flag + ' width="10%"> <br>';
                    row += '<img src="../public/media/city-icon.jpg" width="5%"> <span style="font-size:x-large;">' + data.name + '</span>, ';
                    row +=  "overview: " + data.weather[0].description + "<br>";
                    row += '<img src="../public/media/temp_icon.png" width="5%"> ' + data.main.temp + ", "; 
                    row += "from " + data.main.temp_min + " to " + data.main.temp_max + "<br>";
                    row += '<img src="../public/media/wind_icon.png" width="5%"> ' + data.wind.speed + " m/s <br>";
                    row += '<img src="../public/media/cloud_icon.png" width="5%"> ' + data.clouds.all + "% <br>"; 
                    row += '<img src="../public/media/pressure_icon.png" width="5%"> ' + data.main.pressure + " hpa <br>"; 
                    row += '<img src="../public/media/coord.png" width="5%"> Geo coords [' + data.coord.lon + ", " + data.coord.lat + "] <br>";
                    let sun_time = getTime(data.sys.sunrise, data.timezone);
                    row += '<img src="../public/media/sunrise.png" width="5%">' + sun_time + '<br>';
                    sun_time = getTime(data.sys.sunset, data.timezone);
                    row += '<img src="../public/media/sunset.png" width="5%">' + sun_time + '<br>';
                    row += '</td> </tr>'
                    $('#weather_body').append(row);
                }
            },
            error: function(error) {
                console.log("api_url:" + api_url);
                $(".errorMessage").append("There has been an error! (check your spelling first)");
            }
            
        });
        function getTime(time, timezone) {
            time = time + timezone; 
            let date = new Date(time*1000); //3:12:00 PM
            date = date.toUTCString().slice(17,26);
            if(parseInt(date.slice(0,2)) > 12)
                date = "0" + (parseInt(date.slice(0,2))%12).toString().concat(date.slice(2)) + "PM";
            else 
                date += "AM";
            console.log(date);
            return date;
        }
        function pagination(dataSet, page, rows) {
            var trimStart = (page -1) * rows; 
            var trimEnd = trimStart + rows; 
            var trimmedData = dataSet.slice(trimStart, trimEnd);
            var pages = Math.ceil(dataSet.length/rows);

            return {
                'dataSet': trimmedData,
                'pages': pages
            }
        }
        function pageButtons(pages) {
            var wrapper = document.getElementById('pagination-wrapper');
            wrapper.innerHTML = '';
            for(var page = 1; page <= pages; page++) {
                wrapper.innerHTML += '<li><button id="page_num' + page + '" value=' + page + ' class="page btn btn-sm btn-info">' + page + '</button></li>'
            }
            let page_num = '#page_num' + state.page;
            $(page_num).addClass('active');
            $('.page').on('click',function() {
                $('#weather_body').empty();
                state.page = $(this).val();
                buildTable(); 
            });
        }
        function buildTable() {
            var flags = [];
            flags = [];
            var table = $('#weather_body');
            var table_data = pagination(state.dataSet, state.page, state.rows);
            myList = table_data.dataSet;
            for(var i = 1 in myList) {
                $.ajax({
                    async: false,
                    dataType: 'json',
                    url: 'https://restcountries.eu/rest/v2/alpha/' + myList[i].sys.country,
                    success: function(result) {
                        flags.push(result.flag);
                    }
                });
            }
            for(var i = 0; i < myList.length; i++) {
                var row = '<tr> <td>';
                row += '<img src=' + flags[i] + ' width="10%"> <br>';
                row += '<img src="../public/media/city-icon.jpg" width="5%"> <span style="font-size:x-large;">' + myList[i].name + '</span>, ';
                row +=  "overview: " + myList[i].weather[0].description + "<br>";
                row += '<img src="../public/media/temp_icon.png" width="5%"> ' + myList[i].main.temp + ", "; 
                row += "from " + myList[i].main.temp_min + " to " + myList[i].main.temp_max + "<br>";
                row += '<img src="../public/media/wind_icon.png" width="5%"> ' + myList[i].wind.speed + " m/s <br>";
                row += '<img src="../public/media/cloud_icon.png" width="5%"> ' + myList[i].clouds.all + "% <br>"; 
                row += '<img src="../public/media/pressure_icon.png" width="5%"> ' + myList[i].main.pressure + " hpa <br>"; 
                row += '<img src="../public/media/coord.png" width="5%"> Geo coords [' + myList[i].coord.lon + ", " + myList[i].coord.lat + "] <br>";
                let sun_time = getTime(myList[i].sys.sunrise, myList[i].sys.timezone);
                row += '<img src="../public/media/sunrise.png" width="5%">' + sun_time + '<br>';
                sun_time = getTime(myList[i].sys.sunset, myList[i].sys.timezone);
                row += '<img src="../public/media/sunset.png" width="5%">' + sun_time + '<br>';
                row += '</td> </tr>'
                table.append(row);
            };
            pageButtons(table_data.pages);
        }
    });
    
})