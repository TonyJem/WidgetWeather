"use strict";
console.log('JS Veikia');
/**************************************************************
*** G E T T I N G   D A T A   F R O M  openweathermap.org   ***
***************************************************************/
//* Different towns ID:
    // 2643743 // London ID
    // 524901 // Moscow ID
    // 5128581 // New York ID
//- Different towns ID.
let townID = "5128581"; // Set up ID for the needed town;

//** Generate URLs and get SOURCE DATA by requests:
    let currentWeatherURL = "http://api.openweathermap.org/data/2.5/"+ "weather" + "?id=" + townID + "&units=metric&APPID=1f800c8838999ca53110028ba806fd8b";
    let weatherNow = requestFrom(currentWeatherURL);
    console.log(weatherNow);

    let forecastURL = "http://api.openweathermap.org/data/2.5/"+ "forecast" + "?id=" + townID + "&units=metric&APPID=1f800c8838999ca53110028ba806fd8b";
    let forecastData = requestFrom(forecastURL);
    console.log(forecastData);
//-- Generate URLs and get SOURCE DATA by requests.



/**************************************************************
*** C A L C U L A T I O N S ***
***************************************************************/
//** Generate SOURCE ARRAY:
    // Get number of lines returned by API call:
    let cnt = forecastData.cnt;

    // Create source array:
    let arrayData = [];
    for(let i=0;i<=cnt-1;i++){
        arrayData[i] = {
            // local_Date_Time: convertUnixFrom(forecastData.list[i].dt),
            dt: forecastData.list[i].dt,
            icon_id: forecastData.list[i].weather[0].icon,
            temp: forecastData.list[i].main.temp,
        };
    }
    console.log(arrayData);
//-- Generate SOURCE ARRAY.

//*** Generate RESULT ARRAY:
    // Find time diference between two closest by time forecasts:
    let dtDiference = arrayData[1].dt-arrayData[0].dt; 
    
    // Find how many forecosts were provided per 24hours:
    let forecastsPerDay = 24/(dtDiference/60/60);

    //** Find 1st forecast day's 1st row in source array:
        // Get Hour value from source array's 1st item:   
        let minHour = parseInt(convertUnixFrom(arrayData[0].dt).substring(11,13));         
        let curentHour = "";
        let firstDayFirstRowNr = 0;

        for(let i = 0; i < forecastsPerDay; i++){
            // Get Hour value from source array's i item:
            curentHour = parseInt(convertUnixFrom(arrayData[i].dt).substring(11,13));
            // Find minimal value of Hour and find it's row's number:
            if(curentHour < minHour){ 
                minHour = curentHour;
                firstDayFirstRowNr = i;
            }
        }
    //-- Find 1st forecast day's 1st row in arrayData.

    //** Generate WEEKDAYS in RESULT array:
        let arrayResults = [];
        let arrayResultsIndex = 0;

        for(let i = firstDayFirstRowNr; i < arrayData.length; i = i + forecastsPerDay){
            let day = getWeekDayFrom(arrayData[i].dt);
            arrayResults[arrayResultsIndex] = {weekDay: day};
            arrayResultsIndex++;
        }
    //-- Generate WEEKDAYS in RESULT array.

    //** Generate Icon IDs and Max/Min Temperatures in RESULT array:
        let sourceIcons = [];
        let sourceTemperatures = [];
        let sourceIndex = 0;
        let currentDate = getDateFrom(arrayData[firstDayFirstRowNr].dt);
        arrayResultsIndex = -1;

        for(let i=firstDayFirstRowNr; i < arrayData.length; i++ ){
            
            if(getDateFrom(arrayData[i].dt) == currentDate){
                sourceIcons[sourceIndex] = arrayData[i].icon_id;
                sourceTemperatures[sourceIndex] = arrayData[i].temp;
                sourceIndex++;
            } else {
                sendResultsToArray();
                sourceIcons = [];
                sourceTemperatures = [];
                sourceIndex = 0;
                currentDate = getDateFrom(arrayData[i].dt);
                sourceIcons[sourceIndex] = arrayData[i].icon_id;
                sourceTemperatures[sourceIndex] = arrayData[i].temp;
                sourceIndex++;
            }

            if(i == arrayData.length-1){
                sendResultsToArray();
            }
        }
        console.log(arrayResults);
    //-- Generate Icon IDs and Max/Min Temperatures in RESULT array.
//--- Generate RESULT ARRAY.



/**************************************************************
*** I N S E R T I O N   I N T O   H T M L ***
***************************************************************/

//** Current Weather section:
    // Town:
    document.getElementById("town_name").innerHTML = weatherNow.name;
    
    // Weather Icon:
    let iconImageID = weatherNow.weather[0].icon;
    document.getElementById("iconId").src = iconURLby(iconImageID);

    // Temperature:
    document.getElementById("temperature").innerHTML = toCelsius(weatherNow.main.temp);

    // Weather description:
    document.getElementById("weather_description").innerHTML = weatherNow.weather[0].description;
//-- Current Weather section.

//** Forecast Collumns:
    // Load WeekDays:
    adjustAndLoadContent();

    //* Load Icons and Temperatures:
        for(let i=0; i < arrayResults.length; i++){
            document.getElementById("iconId"+i).src = iconURLby(arrayResults[i].icon_id);
            document.getElementById("tempMax"+i).innerHTML = toCelsius(arrayResults[i].tempMax);
            document.getElementById("tempMin"+i).innerHTML = toCelsius(arrayResults[i].tempMin);
        }
    //- Load Icons and Temperatures.
//** Forecast Collumns.



/*********************************************************************
*** F U N C T I O N S ***
*********************************************************************/
//* Create and send request to website and get datastring as JS object:
    function requestFrom(apiURL){
        let request = new XMLHttpRequest(); 
        request.open("GET", apiURL, false);
        request.send();
        let dataObject = JSON.parse(request.responseText);
    return dataObject
    }
//- Create and send request to website and get datastring as JS object.

//* Convert date from Unix TimeStamp to String:
    function convertUnixFrom(timestamp){
        let dt = new Date(timestamp*1000);
        let year = dt.getFullYear();
        let month = "0" + (dt.getMonth()+1);
        let date = "0" + dt.getDate();
        let hr = "0" + dt.getHours();
        let m = "0" + dt.getMinutes();
        let s = "0" + dt.getSeconds();
        let dateAsString = year + "-" + month.substr(-2) + "-" + date.substr(-2) + " " + hr.substr(-2) + ':' + m.substr(-2) + ':' + s.substr(-2);
    return dateAsString;  // Result is Local Time according to browser;
    }
//- Convert date from Unix TimeStamp to String.

//* Get WeekDay from Unix TimeStamp:
    function getWeekDayFrom(timestamp){
        let date = new Date(timestamp*1000);
        let weekday = new Array(7);
        weekday[0] = "sunday";
        weekday[1] = "monday";
        weekday[2] = "tuesday";
        weekday[3] = "wednesday";
        weekday[4] = "thursday";
        weekday[5] = "friday";
        weekday[6] = "saturday";

        let nameOfDay = weekday[date.getDay()];
    return nameOfDay;
    }
//- Get WeekDay from Unix TimeStamp.

//* Get Date from Unix TimeStamp:
    function getDateFrom(timestamp){
        let dt = new Date(timestamp*1000);
        let dateAsInteger = dt.getDate();
    return dateAsInteger;  
    }
//- Get Date from Unix TimeStamp.

//* Send calculated results to Result array:
    function sendResultsToArray(){
        arrayResultsIndex++;
        arrayResults[arrayResultsIndex].icon_id = findMainIconIn(sourceIcons);
        arrayResults[arrayResultsIndex].tempMax = Math.max(...sourceTemperatures);
        arrayResults[arrayResultsIndex].tempMin = Math.min(...sourceTemperatures);
    }
//- Send calculated results to Result array.

//** Find mostly frequent ICON per day:
    function findMainIconIn(inputArray){
        // Array to keep icon_id and it's quantity:
        let iconArray = []; 
        // Index value for array above:
        let iconArrayIndex = 0;

        for(let j=0; j<=inputArray.length-2; j++){
            if(inputArray[j] !== "empty"){
                let q = 1;
                for(let i=j+1; i<=inputArray.length-1; i++){
                    if(inputArray[j] == inputArray[i]){
                        inputArray[i] = "empty";
                        q++;  
                    }
                }
                iconArray[iconArrayIndex] = {icon_id: inputArray[j], quantity: q};
                iconArrayIndex++;
            }
        }

        // Check if last source array's item's value is not ="emty":
        if(inputArray[inputArray.length-1] !== "empty"){
            // Create last item for result array:
            iconArray[iconArrayIndex] = {icon_id: inputArray[inputArray.length-1], quantity: 1};
        }

        //* Find Max quantity:
            let quantities = [];
            for(let i=0; i<=iconArray.length-1; i++){
                quantities[i]=iconArray[i].quantity;
            }
            let maxQuantity = Math.max(...quantities);
        //- Find Max quantity.

        //* Return icon according to MaxQuantity value:
            let currentIndex = -1;
            do {
                currentIndex++;
            }
            while (iconArray[currentIndex].quantity < maxQuantity);

            let mainIcon_id = iconArray[currentIndex].icon_id;        
        //- Return icon according to MaxQuantity value.
    return mainIcon_id;  
    }
//-- Find mostly frequent ICON per day.

//* Generate icon source URL according to Icon ID:
    function iconURLby(iconID){
        let iconLinkString = "http://openweathermap.org/img/wn/" + iconID + "@2x.png";  
    return iconLinkString;
    }
//- Generate icon source URL according to Icon ID.

//* Round to integer without digits after comma and ads Celsius symbol:
    function toCelsius(Temperature){
        let TempAsString = Math.round(Temperature) + "&#x2103";  
        // Code "&#x2103" adds DEGREE CELSIUS to the end.
    return TempAsString; // Code "&#x2103" = "DEGREE CELSIUS";
    }
//- Round to integer without digits after comma and ads Celsius symbol.

//*** Generate and show content depending on screen width:
    function adjustAndLoadContent(){
        //** Show Current Screen Width:
            // Take Current width value from HTML div element:
            let currentWidth = document.getElementById("divWidth").offsetWidth;

            document.getElementById("currentWidth").innerHTML = "Curent width: "+ currentWidth +" px";
        //-- Show Current Screen Width.

        //** Show current Layout's Option:
            //* Layout options:
                let txtLayout1 = "Layout 1 (For screens from: 0 to 575px)";
                let txtLayout2 = "Layout 2 (For screens from: 576 to 767px)";
                let txtLayout3 = "Layout 3 (For screens from: 768 to 991px)";
                let txtLayout4 = "Layout 4 (For screens from: 992px to ...)";
            //- Layout options.

            if(currentWidth <= 575){
                document.getElementById("layoutNr").innerHTML = txtLayout1;
            } else if(currentWidth > 575 && currentWidth <= 767){
                document.getElementById("layoutNr").innerHTML = txtLayout2;
            } else if(currentWidth > 767 && currentWidth <= 991){
                document.getElementById("layoutNr").innerHTML = txtLayout3;
            } else {
                document.getElementById("layoutNr").innerHTML = txtLayout4;
            }
        //-- Show current Layout's Option.

        //** Change WeekDay name's lenght and use it's Short or Long version:
            // Change lenght to "SHORT" if it is "NORMAL":
            if(currentWidth < 992 && currentWidth >= 576){
                for(let i=0; i < arrayResults.length; i++){
                    document.getElementById("day" + i).innerHTML = arrayResults[i].weekDay.substring(0,3);
                }
            // Change lenght to "NORMAL" if is "SHORT":
            } else {
                for(let i=0; i < arrayResults.length; i++){
                    document.getElementById("day" + i).innerHTML = arrayResults[i].weekDay;
                }
            }
        //-- Change WeekDay name's lenght and use it's Short or Long version.
    }
//--- Generate and show content depending on screen width.