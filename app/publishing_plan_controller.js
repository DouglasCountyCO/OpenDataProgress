$(function () {
    
    
    var tabIdx = 0;
    function setMenuTabState() {
        if(tabIdx === 0) {
            $('.scroll-controls.scroll-prev').hide();
            $('.scroll-controls.scroll-next').show();
        } else if(tabIdx == $('.menu-item a').length - 1) {
            $('.scroll-controls.scroll-next').hide();
            $('.scroll-controls.scroll-prev').show();
        } else {
            $('.scroll-controls.scroll-next').show();
            $('.scroll-controls.scroll-prev').show();
        }
    }
    
    // Create nav selection
    $('.menu-item').on('click', 'a', function(ev) {
        ev.preventDefault();
        $('.menu-item a').removeClass('selected');
        $(this).addClass('selected');
        
        tabIdx = $('.menu-item a').index(this);
        setMenuTabState();
        window.history.pushState({tab: tabIdx}, 'tabOrder',$(this).attr("href"));

        $(".content-inner").addClass("hidden");
        $('#' + $(this).data("rel")).removeClass('hidden');
    });
    
    // Add hooks to switch views left and right
    if(window.history.state && window.history.state['tab']) {
        tabIdx = window.history.state['tab'];
    }
    if($(".menu-item a[href='"+window.location.hash+"']").length) {
        tabIdx = $('.menu-item a').index($(".menu-item a[href='"+window.location.hash+"']")[0]);
    }
    $('.menu-item a').removeClass('selected');
    $('.menu-item a:eq(' + tabIdx + ')').addClass('selected');
    $('.menu-item a:eq(' + tabIdx + ')').click();
    
    setMenuTabState();
    
//    $('.scroll-controls.scroll-prev').hide();
    $('.scroll-nav').on('click', 'a', function(ev) {
        ev.preventDefault();
        switch ($(this).data('direction')) {
            case 'prev':
                if (tabIdx > 0) {
                    tabIdx--;
                    $('.scroll-controls.scroll-next').show();
                    if (tabIdx == 0) {
                        $('.scroll-controls.scroll-prev').hide();
                    }
                } else {
                    $('.scroll-controls.scroll-prev').show();                  
                }
                break;
                
            case 'next':
                if (tabIdx < $('.menu-item a').length - 1) {
                    tabIdx++;
                    $('.scroll-controls.scroll-prev').show();                  
                    if (tabIdx == $('.menu-item a').length - 1) {
                        $('.scroll-controls.scroll-next').hide();
                    }
                } else {
                    $('.scroll-controls.scroll-next').show();
                }
                break;
        }
        $('.menu-item a').removeClass('selected');
        $('.menu-item a:eq(' + tabIdx + ')').addClass('selected');
        $('.menu-item a:eq(' + tabIdx + ')').click();
    });

    // Add scroll to top on the bottom up button
    $('.scroll-top').click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 400);
        return false;
    });

    /////////////////////////////////////////////
    ////////////////  Blog   ////////////////////
    /////////////////////////////////////////////
    $.jGFeed('http://www.douglas.co.us/category/open-data/feed/',
    function (feeds) {
        if (!feeds) {
            return false;
        }

        feeds.processDate = function ( feed ) {
            // Inside the callback 'this' corresponds to the entry being processed
            var date = new Date(this.publishedDate);
            var months = date.getMonth() + 1;
            if ( months <= 9) months = '0' + months;  //adding leading zeros
            var days = date.getDate();
            if (days <= 9) days = '0' + days;         //adding leading zeros
            var pieces = [months, days, date.getFullYear()]
            return this.publishedDate = pieces.join('/');
        }

        var template = $('#template-blog').html();
        $('#target-blog').html( Mustache.render(template, feeds) );
    }, 10);

    $.getJSON('https://data.douglas.co.us/api/catalog/v1?only=story', function(data) {
        if (data.results) {
            var stories = data.results.map(function(r) {
                return {
                    title: r.resource.name,
                    processDate: r.resource.updatedAt,
                    contentSnippet: r.resource.description,
                    link: r.link
                }
            });
            var template = $('#template-blog').html();
            $('#target-stories').html( Mustache.render(template, { entries: stories }) );
        }
    })
    
    /////////////////////////////////////////////
    //////////////// Summary ////////////////////
    /////////////////////////////////////////////

    table = 'fjm6-awbe',
    baseUrl = 'data.douglas.co.us',
    targets = [];

    function getPlanDates(index) {
        index = parseInt(index);
        var planPeriods = ['07/01/2016', '01/01/2016', '01/01/2015'];
        if (!index) {
            index = 0;
        }
        return {
            before: moment(planPeriods[index + 1], 'MM/DD/YYYY').add(6, 'months').format("YYYY-MM-DD"),
            after: moment(planPeriods[index + 1], 'MM/DD/YYYY').format("YYYY-MM-DD")
        };
    }

    var initialDates = getPlanDates(0),
        targetDate,
        sinceDate;
    
    function renderIndicators(initialDates, index) {
        if (!index) {
            index = 0;
        }
        index = parseInt(index);
        if (initialDates && initialDates.before && initialDates.after) {
            targetDate = moment(initialDates.before).subtract(1, "day").format('MMM, DD YYYY');
            sinceDate = moment(initialDates.after).format('MMM YYYY');
            $("#chart-targeted-citywide .chart-targeted-date").html(targetDate);
            $('.targeted-date').html(targetDate);
            $("#chart-published-since .chart-published-since-date").html(sinceDate);
        }
        $("#chart-targeted-citywide .chart-number").html(targets[index]);
    }

    storeMain = new SV.Store({
        table: table,
        baseUrl: baseUrl
    }).load({
        filter: {
            $select: 'count(*) AS count',
            $where: 'date_published >= "'+initialDates.after+'" AND date_published <= "'+initialDates.before+'"'
        }
    }, function(data) {
        if (data && data[0] && data[0].count) {
            $("#chart-published-since .chart-number").html(data[0].count);
        }
    });
    
    var dts = getPlanDates(0);
    storeMain.load({
        filter: {
            $select: 'count(*) AS count',
            $where: 'date_added >= "'+dts.after+'" AND date_added <= "'+dts.before+'"'
        }
    }, function(data) {
        if (data && data[0] && data[0].count) {
            targets.push(data[0].count);
        }
    });
    
    var dts = getPlanDates(1);
    storeMain.load({
         filter: {
            $select: 'count(*) AS count',
            $where: 'date_added >= "'+dts.after+'" AND date_added <= "'+dts.before+'"'
        }
    }, function(data) {
        if (data && data[0] && data[0].count) {
            targets.push(data[0].count);
        }
        renderIndicators(initialDates, 0);
    });

    categoryCombo = new SV.Combo('#category-picker-select', {
        baseUrl: baseUrl,
        field: 'category',
        defaulttext: 'All Categories',
        defaultvalue: '#all#',
        table: table
    });
    
    categoryCombo.store.load({
        field: 'category',
        filter: {
            $select: 'category, count(*) as count',
            $where: 'category IS NOT NULL',
            $group: 'category',
            $order: 'category ASC'
        }
    })

    piePublished = new SV.PieChart('#chart', {
        table: table,
        baseUrl: baseUrl,
        transformtype: 'transform',
        size: {
            width: 100,
            height: 100
        },
        colors: {
            "Published": '#91CC9F',
            "Not Published": '#33CC69'
        },
        color: function (color, d) {
            return d && d === 'Not Published' ? d3.rgb(color).darker(.6) : color;
        },
        percentageKey: 'Published'
    });
    
    piePublished.loadCount('publishing_status',{
        aggregatefield: 'dataset_name'
    });
    
    piePublished.addListener('change', function (data) {
        $("#chart-number-published .chart-number").html(piePublished.getPercent('Published'));
        var ratio = (piePublished.getValue('Published') ? piePublished.getValue('Published') : 0) + "/" + piePublished.total + " datasets";
        $("#chart-number-published .ratio").html(ratio);
    });

    bar = new SV.BarChart('#chartbar', {
        table: table,
        baseUrl: baseUrl,
        field: 'month',
        size: {
            width: 100,
            height: 100
        },
        colors: {
            "count": "#ffffff"
        },
        xFormat: '%Y-%m-%dT%H:%M:%S.%L',
        mimeType: 'json',
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: function (x) {
                        var m = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                        return m[x.getMonth()];
                    }
                }
            }
        },
        keys: {
            x: 'month',
            value: ['count']
        },

    });
    
    bar.store.load({
        field: 'month',
        filter: {
            $select: 'date_trunc_ym(date_published) AS month, count(*) AS count',
            $where: 'month IS NOT NULL AND month >= "'+initialDates.after+'" AND month <= "'+initialDates.before+'"',
            $group: 'month',
            $order: 'month ASC'
        }
    });

    changeIndicators = function () {
        var categoryfilter = null;
        var where = '';

        if (categoryCombo.value != '#all#') {
            categoryfilter = {
                field: 'category',
                type: 'text',
                operator: '=',
                value: categoryCombo.value
            }
            where = 'category="'+categoryCombo.value+'"';
        }
        piePublished.loadCount('publishing_status',{
            aggregatefield: 'dataset_name',
            $where: (where != '') ? where : ''
        });

        var dateValues = getPlanDates($('#plan-picker-select').val());

        bar.store.load({
            field: 'month',
            filter: {
                $select: 'date_trunc_ym(date_published) AS month, count(*) AS count',
                $where: 'month IS NOT NULL' + ( (where != '') ? ' AND ' + where : '') + ' AND month >= "'+dateValues.after+'" AND month <= "'+dateValues.before+'"',
                $group: 'month',
                $order: 'month ASC'
            }
        });

        storeMain.load({
            filter: {
                $select: 'count(*) AS count',
                $where: 'date_published >= "'+dateValues.after+'" AND date_published <= "'+dateValues.before+'"' + ((where != '') ? ' AND ' + where : '')
            }
        }, function(data) {
            if (data && data[0] && data[0].count) {
                $("#chart-published-since .chart-number").html(data[0].count);
            }
        });
        renderIndicators(dateValues, $('#plan-picker-select').val());
    }
    
    categoryCombo.addListener('change', changeIndicators);
    $('#plan-picker-select').change(changeIndicators);
    
    ////////////////// Participating //////////////////////////////

    participatingPie1 = new SV.PieChart('#participating-pie1', {
        table: 'ish9-efvh',
        baseUrl: baseUrl,
        legend: {
          show: true,
          position: 'bottom'
        },
        patterncolors: ['#304131', '#39513b', '#4d6b4f', '#719974']
    });
        // patterncolors: ['#1A6735', '#33CC69', '#1A6800','#1A6735','#1A6800']

    participatingPie1.loadCount('status', {
        aggregatefield: 'status'
    });

    participatingPie2 = new SV.PieChart('#participating-pie2', {
        table: 'ish9-efvh',
        baseUrl: baseUrl,
        legend: {
          show: true,
          position: 'bottom'
        },
        patterncolors: ['#304131', '#39513b', '#4d6b4f', '#719974']
    });
        // patterncolors: ['#1A6735', '#33CC69', '#1A6800','#1A6735','#1A6800']

    participatingPie2.loadCount('type', {
        aggregatefield: 'type'
    });

    participatingList = new SV.Store({
        table: 'ish9-efvh',
        baseUrl: baseUrl
    }).load({
        filter: {
            $select: '*',
            $order: 'department'
        }
    }, function(data) {
        $.each(data, function(idx, dt) {
            if (dt.website && dt.website.url) {
                $('#participating-list').append('<li class="department"><a target="_blank" href="' + dt.website.url + '">' + dt.department + '</a><br>Status: ' + dt.status + '</li>')
            } else {
                $('#participating-list').append('<li class="department">' + dt.department + '<br>Status: ' + dt.status + '</li>')                
            }
        });
    });

    /////////////////////////////////////////////
    //////////////// Publishing Plan ////////////////////
    /////////////////////////////////////////////
   
    publishedFromInventryPie = new SV.PieChart('#publishedFromInventryPie', {
        table: table,
        baseUrl: baseUrl,
        legend: {
          show: true,
          position: 'bottom'
        },
        patterncolors: ['#1A6735', '#33CC69', '#1A6800','#1A6735','#1A6800']
    });

    publishedFromInventryPie.loadCount('publishing_status',{
        aggregatefield: 'dataset_name',
        where:'publishing_status="published" OR publishing_status="Not Published"',
    });

    publishedFromInventryPie.addListener('change', function(data) {
        $("#stat-published-datasets .stat-number").html(publishedFromInventryPie.getValue('Published'));
        $("#stat-inventoried-datasets .stat-number").html(publishedFromInventryPie.getValue('Not Published'));
    });
    
    datasetStatusPie = new SV.PieChart('#datasetStatusPie', {
        table: table,
        baseUrl: baseUrl,
        legend: {
          show: true,
          position: 'bottom'
        },
        patterncolors: ['#1A6735', '#33CC69', '#1A6800','#1A6735','#1A6800']
    });

    datasetStatusPie.loadCount('dataset_status',{
        where:'publishing_status="published" OR publishing_status="Not Published"',
    });

    metadataStatusPie = new SV.PieChart('#metadataStatusPie', {
        field: 'metadata_status',
        table: table,
        baseUrl: baseUrl,
        legend: {
          show: true,
          position: 'bottom'
        },
        patterncolors: ['#1A6735','#33CC69']
    });

    metadataStatusPie.store.load({
        field: 'metadata_status',
        filter: {
            $select: 'CASE(metadata_complete="TRUE","Complete",metadata_complete="FALSE","Not complete") as metadata_status, count(*) as count',
            $where: 'publishing_status="published" AND (metadata_status = "TRUE" OR metadata_status = "FALSE")',
            $group: 'metadata_status'
        }
    });
    
    nativelyHostedPie = new SV.PieChart('#nativelyHostedPie', {
        field: 'natively_hosted',
        table: table,
        baseUrl: baseUrl,
        legend: {
          show: true,
          position: 'bottom'
        },
        patterncolors: ['#1A6735','#33CC69']
    });

    nativelyHostedPie.store.load({
        field: 'natively_hosted',
        filter: {
            $select: 'CASE(natively_hosted="TRUE","Natively Hosted",natively_hosted="FALSE","Not Natively Hosted") as natively_hosted, count(*) as count',
            $where: 'publishing_status="published"',
            $group: 'natively_hosted'
        }
    });
    
    bar01 = new SV.BarChart('#chartbar01', {
        table: table,
        baseUrl: baseUrl,
        size: {
            width: 900,
            height: 200
        },
        colors: {
            "count": "#1A6800"
        },
        xFormat: '%Y-%m-%dT%H:%M:%S.%L',
        mimeType: 'json',
        names: {
            not_published: "Not Published",
            published: "Published",
            count: "Count"
        },
        axis: {
          x: {
            show: true,
            type: 'timeseries',
            tick: {
              format: '%b %Y'
            }
          },
            y: {
                show: true,
                padding: {
                    top: 3,
                    bottom: 0
                },
                tick: {
                    format: null
                }
            }
        },
        keys: {
            x: 'month',
            value: ['count']
        }
    });

    bar01.store.load({
        field: 'month',
        filter: {
            $select: 'date_trunc_ym(date_published) AS month, count(*) as count',
            $group: 'month',
            $order: 'month'
        }
    });
    
    bar02 = new SV.BarChart('#chartbar02', {
        table: table,
        baseUrl: baseUrl,
        size: {
            width: 900,
            height: 200
        },
        colors: {
            "count": "#1A6800"
        },
        xFormat: '%Y-%m-%dT%H:%M:%S.%L',
        mimeType: 'json',
        names: {
            not_published: "Not Published",
            published: "Published",
            count: "Count"
        },
        axis: {
          x: {
            show: true,
            type: 'timeseries',
            tick: {
              format: '%Y'
            }
          },
            y: {
                show: true,
                padding: {
                    top: 3,
                    bottom: 0
                },
                tick: {
                    format: null
                }
            }
        },
        keys: {
            x: 'year',
            value: ['count']
        }
    });

    bar02.store.load({
        field: 'month',
        filter: {
            $select: 'date_trunc_y(date_published) AS year, count(*) as count',
            $group: 'year',
            $order: 'year'
        }
    });
   
    categoryBar = new SV.BarChart('#categoryBar', {
        table: table,
        baseUrl: baseUrl,
        size: {
            width: 630,
            height: 300
        },
        field: 'category',
        colors: {
            "count": "#1A6735"
        },
        xFormat: '',
        mimeType: 'json',
        names: {
            not_published: "Not Published",
            published: "Published",
            count: "Count"
        },
        axis: {
            x: {
                show: true,
                type: 'category',
                tick: {
                    format: ''
                }
            },
            y: {
                show: true,
                default: [0, 1000],
                padding: {
                    top: 3,
                    bottom: 0
                },
                tick: {
                    format: null
                }
            }
        },
        keys: {
            x: 'category',
            value: ['count']
        }
    });

    categoryBar.loadCount('category', {
        where: 'category <> ""',
        order: 'count DESC'
    });
    
    bar3 = new SV.BarChart('#chartstackedbar2', {
        table: table,
        baseUrl: baseUrl,
        field: 'department_priority',
        colors: {
            "published": "#1A6800",
            "not_published": "#33CC69"
        },
        xFormat: '',
        transformtype:'normalize',
        groups: [['published','not_published']],
        mimeType: 'json',
        names: {
            not_published: "Not Published",
            published: "Published",
            count: "Count"
        },
        axis: {
          x: {
            show: true,
            type: 'category',
            tick: {
              format: ''
            }
          },
            y: {
                show: true,
                padding: {
                    top: 3,
                    bottom: 0
                },
                tick: {
                    format: d3.format('.2p') 
                }
            }

        },
        keys: {
            x: 'department_priority',
            value: ['published','not_published']
        }
    });

    bar3.store.load({
        field: 'department_priority',
        filter: {
            $select: 'department_priority, sum(CASE(publishing_status="published",1)) as published, sum(CASE(publishing_status="Not Published", 1)) as not_published, count(*) as total',
            $group: 'department_priority',
            $order: 'department_priority ASC'            
        }
    });

    $('.by-year').on('click', function(ev){
        $('#chartbar01').toggle();
        $('#chartbar02').toggle();
        ev.preventDefault();
    })

});