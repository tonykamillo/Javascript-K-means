usedColors = [];

function randomize(limit, set)
{
    if(set)
    {
        var choosen = [];
        while(choosen.length < limit)
        {
            var index = Math.floor(Math.random() * set.length);
            choosen[choosen.length] = set[index];
            set.splice(index, 1);
        }
        return choosen;
    }
    return Math.floor(Math.random() * limit);
}

function getColor()
{
    var color = '#000000';
    while( $.inArray(color, usedColors) > -1 )
    {
        var r = toHex(randomize(256));
        var g = toHex(randomize(256));
        var b = toHex(randomize(256));
        color = '#'+r+g+b;
    }
    usedColors[usedColors.length] = color;
 	return color;
}

function toHex(number)
{
    number = number.toString(16);
    if( number.length < 2)
        number = "0"+number;
    return number;
}

function createGrid(area)
{
    var x = y = Math.floor(area/15);
    var i, j;

    $('#space').width(area).height(area).html('');
    for(i=0; i<x; i++)
    {
        for(j=0; j<y; j++)
        {
            $('#space').append('<span id="'+i+'-'+j+'" class="point"></span>');
        }
    }
}

function createPoints(amount)
{
    var points = randomize(parseInt(amount), $('.point:not(.data, .centroid)'));

    $.each(points,
        function(index, item)
        { $(item).css({backgroundColor:'#666'}).addClass('data'); }
    );
}

function defineCentroids(amount)
{
    var centroids = $('.centroid');
    if( centroids.length > 0 )
    {
        $.each(centroids,
            function(index, item)
            {
                var id = $(item).attr('cluster');
                var coords = calculateCentroid(id, 2);
                $(item).removeClass('centroid').removeAttr('cluster').html('');
                $('#'+coords[0]+'-'+coords[1]).addClass('centroid')
                    .attr('cluster', id).html('*').css({
                        backgroundColor:$(item).css('background-color')
                    });
            }
        );
    }
    else
    {
        centroids = randomize(parseInt(amount), $('.point'));
        $.each(centroids,
            function(index, item)
            {
                $(item).css({backgroundColor:getColor()})
                    .addClass('centroid').attr('cluster', index).html('*');
            }
        );
    }
}

function measureDistance(a, b)
{
    //Euclidean Distance
    var i, distance = 0.0;
    for(i=0; i<a.length; i++)
        distance += Math.pow((a[i]-b[i]), 2);
    return Math.sqrt(distance);
}

function calculateCentroid(clusterIndex, dimension)
{
    var cluster = $('.cluster-'+clusterIndex), i, centroid = [];
    for(i=0; i<dimension; i++)
    {
        centroid[centroid.length] = 0.0;
        $.each(cluster,
            function(index, item)
            { centroid[i] += parseInt($(item).attr('id').split('-')[i]);  }
        );
        centroid[i] = Math.floor(centroid[i] / cluster.length);
    }
    return centroid;
}

function clusterize()
{
    var centroids = $('.centroid'), data = $('.data');

    $.each(data,
        function(i, item)
        {
            var small = null;
            $.each(centroids,
                function(j, centroid)
                {
                    var a = $(item).attr('id').split('-'),
                        b = $(centroid).attr('id').split('-');

                    var current = measureDistance(a, b);

                    if( small == null || current < small[0] )
                        small = [current, centroid];
                }
            );
            $(item).css({
                backgroundColor: $(small[1]).css('background-color')
            }).addClass( 'cluster-'+$(small[1]).attr('cluster') );
        }
    );
}

function reset()
{
    $('.point').removeClass('data').removeClass('centroid')
        .removeAttr('cluster').removeAttr('style').html('');
}

function init(area)
{
    createGrid(area);

    $('.add-points').click(
        function()
        { createPoints( $('#amount-points').val() ); }
    );

    $('.define-centroids').click(
        function()
        { defineCentroids( $('#amount-k-means').val() ); }
    );

    $('.clusterize').click( clusterize );

    $('.reset').click( reset );

    $('#k-means').show(1000);
}

$(document).ready(function(){

    $('.area-size').click(
        function()
        { init( parseInt($('#area-size').val()) ); }
    );

});

