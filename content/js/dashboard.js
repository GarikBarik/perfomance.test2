/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 97.81894233642068, "KoPercent": 2.181057663579325};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9061099492082462, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4305555555555556, 500, 1500, "сreate transaction"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9977997799779978, 500, 1500, "adding product to transaction"], "isController": false}, {"data": [0.993949394939494, 500, 1500, "create order"], "isController": false}, {"data": [0.9538300104931794, 500, 1500, "open transaction"], "isController": false}, {"data": [1.0, 500, 1500, "transfer transaction to prepay"], "isController": false}, {"data": [0.9970119521912351, 500, 1500, "сreate session"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6694, 146, 2.181057663579325, 351.7399163429941, 0, 14174, 125.0, 989.0, 1091.25, 1966.2000000000007, 11.14036459980229, 12.056835996658222, 4.68150064104111], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["сreate transaction", 1008, 97, 9.623015873015873, 1710.2351190476197, 797, 14174, 1031.0, 1424.8000000000002, 4841.099999999989, 14086.0, 1.680565790482796, 1.7240749046970814, 1.4097714980710172], "isController": false}, {"data": ["Debug Sampler", 1004, 0, 0.0, 0.26494023904382485, 0, 17, 0.0, 1.0, 1.0, 2.0, 1.6766223074264015, 1.1379989762208533, 0.0], "isController": false}, {"data": ["adding product to transaction", 909, 0, 0.0, 149.06270627062722, 99, 997, 139.0, 186.0, 209.5, 288.39999999999986, 2.155387044914567, 3.0436422528774063, 1.0482253402025923], "isController": false}, {"data": ["create order", 909, 5, 0.5500550055005501, 125.35093509350934, 79, 964, 119.0, 154.0, 171.0, 229.89999999999998, 2.163765380229992, 3.0436295936869944, 0.7459074015831907], "isController": false}, {"data": ["open transaction", 953, 44, 4.616998950682056, 125.20146904512056, 71, 459, 116.0, 162.0, 183.29999999999995, 290.96000000000095, 1.7136589225347048, 1.7841845341383153, 0.5862887056750341], "isController": false}, {"data": ["transfer transaction to prepay", 907, 0, 0.0, 163.75633958103646, 106, 488, 156.0, 207.20000000000005, 231.0, 295.91999999999996, 2.1579618561802887, 3.0536003218801153, 0.7502289265626785], "isController": false}, {"data": ["сreate session", 1004, 0, 0.0, 112.62749003984067, 80, 668, 102.5, 136.5, 160.75, 282.0000000000009, 1.6736290077913765, 1.1522543461844925, 0.9512227368501769], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 48, 32.87671232876713, 0.717060053779504], "isController": false}, {"data": ["Value expected to be 'SUCCESS', but found 'TRANSACTION_IMPOSSIBLE_STATE_TRANSITION'", 5, 3.4246575342465753, 0.07469375560203168], "isController": false}, {"data": ["Value expected to be 'SUCCESS', but found 'NOT_FOUND'", 91, 62.32876712328767, 1.3594263519569765], "isController": false}, {"data": ["Value expected to be 'SUCCESS', but found 'ERROR'", 2, 1.36986301369863, 0.02987750224081267], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6694, 146, "Value expected to be 'SUCCESS', but found 'NOT_FOUND'", 91, "502/Bad Gateway", 48, "Value expected to be 'SUCCESS', but found 'TRANSACTION_IMPOSSIBLE_STATE_TRANSITION'", 5, "Value expected to be 'SUCCESS', but found 'ERROR'", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["сreate transaction", 1008, 97, "502/Bad Gateway", 48, "Value expected to be 'SUCCESS', but found 'NOT_FOUND'", 47, "Value expected to be 'SUCCESS', but found 'ERROR'", 2, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["create order", 909, 5, "Value expected to be 'SUCCESS', but found 'TRANSACTION_IMPOSSIBLE_STATE_TRANSITION'", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["open transaction", 953, 44, "Value expected to be 'SUCCESS', but found 'NOT_FOUND'", 44, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
