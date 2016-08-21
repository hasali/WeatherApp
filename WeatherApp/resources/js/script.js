 
var sList = new Array();
var myApp ={};



    //math helper//
Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
        
    return {
        "+": Math.round(lvalue + rvalue),
        "-": Math.round(lvalue - rvalue),
        "*": Math.round(lvalue * rvalue),
        "/": Math.round(lvalue / rvalue),
        "%": Math.round(lvalue % rvalue)
    }[operator];
});

Handlebars.registerHelper('trim', function(passedString) {
    var s = passedString.substring(0,10);
    return new Handlebars.SafeString(s);
});
 function loadChartData(labels, data1, data2,canvas){
            
    var data = {
    labels: labels,
    datasets: [
        {
            label: "Max",
            fill: true,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: data1,
            spanGaps: false,
        },
        {
            label: "Min",
            fill: true,
            lineTension: 0.1,
            backgroundColor: "rgba(75,66,192,0.4)",
            borderColor: "rgba(75,66,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,66,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,66,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: data2,
            spanGaps: false,
        }
    ]
    };
    var myLineChart = new Chart(canvas,{
        type: 'line',
        data: data,
            options: {
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Temperature in \xB0C'
                        }
                    }],
                     xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: '5 Day Forcast' 
                            }
                        }]   
                    }
                }   
        });
};

$(document).one("pagecreate", function(){
    var myLocation ={};
    
    function getLocation(){
        var deferred = $.Deferred();

        navigator.geolocation.getCurrentPosition(function(position){
            myLocation.lat = position.coords.latitude;
            myLocation.lng = position.coords.longitude;
            deferred.resolve();
        });
        return deferred.promise();
    }
       
    getLocation().done(function() {

        $.getJSON('http://api.openweathermap.org/data/2.5/forecast?lat='+myLocation.lat+'&lon='+myLocation.lng+'&APPID=0a8b715eb075df37a89ad593eba2175c')
            .done(function(data){
                var min = 1000;
                var max = -1000;
                var labels = new Array();
                var data1 = new Array();
                var data2 = new Array();
            
                var jqmPage = $('#jqmPage').html();
                var generateHTML = Handlebars.compile(jqmPage);
                var html = generateHTML(data);
                $('#current').append(html);
                $.mobile.changePage('#home');

                //chart data Find high and lows throughout day


                $.each(data.list, function(index,list){
                    if(list.main.temp_max > max)
                        max = list.main.temp_max;
                    if(list.main.temp_min < min)
                        min = list.main.temp_min;
                    if(index % 8==0){
                        labels.push(list.dt_txt.substring(0,10)); 
                        data1.push(Math.round(max-274.15));
                        data2.push(Math.round(min-274.15));

                        min = 1000;
                        max = -1000;
                    };
                });
            
             loadChartData(labels, data1, data2, $('#canvas'));   
        }) 
       
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            alert( "Request Failed: " + err );
        });
    }); 
  });      
  function getCity(city){
      
        $.getJSON('http://api.openweathermap.org/data/2.5/forecast?q='+city+'&APPID=0a8b715eb075df37a89ad593eba2175c')
        .done(function(data){

            var min = 1000;
            var max = -1000;
            var labels = new Array();
            var data1 = new Array();
            var data2 = new Array();
            
            var jqmPage = $('#jqmPage').html();
            var generateHTML = Handlebars.compile(jqmPage);
            var html = generateHTML(data);
            $('#chosen').html(html);
            $.mobile.changePage('#placesList');

            $.each(data.list, function(index,list){
                if(list.main.temp_max > max)
                    max = list.main.temp_max;
                if(list.main.temp_min < min)
                    min = list.main.temp_min;
                if(index % 8==0){
                    labels.push(list.dt_txt.substring(0,10)); 
                    data1.push(Math.round(max-274.15));
                    data2.push(Math.round(min-274.15));

                    min = 1000;
                    max = -1000;
                };
            });
           
            loadChartData(labels,data1,data2,$('#canvas2')); 
        })
        .fail(function(data){
            alert("no city found")
        })
    }

    $(document).one("pageshow", "#home", function(){
        
        $('#home').bind('pageinit', function(){
            $('searched').listview('refresh');
        })
        $.getJSON('resources/data/cities.json', function(data){
           $.each(data.city, function(index, city){
                $('#myList').append('<li id="clist" data-type="'+city.name+'"><a href="#">' + city.name + '</a></li>');
                $('#myList').listview('refresh');
            }); 
        });
    
        $(document).one('click','#clist', function(){
            
            getCity($(this).data('type'));  
        });
        
        if (localStorage.sList){
         
            loadItems();
        }
       
        
        function loadItems()
        {
            sList = JSON.parse(localStorage.sList);
             for( var i= 0; i<sList.length;i++)
             {
                 $('#searched').append('<li>' +sList[i]+ '</li>');
                 $('#searched').listview().listview('refresh');
                 $('#search').val(''); 
             }
         
        }
       
        $(document).one('click','#btnS', function(){
            var cname= $('#search').val();
            if(cname =='')
                alert("Error");
            else{
                    
                
                sList.push(cname);
                localStorage.sList=JSON.stringify(sList);
              
                $('#search').val('');
                getCity(cname);
               
            }   
        }) 
    });



     

    $(document).one("pageshow", "#placesList", function(){
        $(document).one('click', '#back', function(){
            location.reload();
        })
        
      
    });

   

  
