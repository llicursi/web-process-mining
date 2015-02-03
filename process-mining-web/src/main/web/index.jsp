<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        <meta charset="utf-8">
        <title>Database process documentation</title>
        <link rel="stylesheet" href="resources/css/bootstrap.css"/>
        <link rel="stylesheet" href="resources/css/style.css"/>
        <link rel="stylesheet" href="resources/css/svg.css"/>
    </head>
    <body>
        <!--[if lt IE 9]>
        <div class="unsupported-browser">
            This website does not fully support your browser.  Please get a
            better browser (Firefox or <a href="/chrome/">Chrome</a>, or if you
            must use Internet Explorer, make it version 9 or greater).
        </div>
        <![endif]-->
        <div id="split-container">
            <div id="graph-container" style="height: 460px; visibility: visible;">
                <div id="graph" style="display: block; height: 1500px;"></div>
            <div id="docs-container" style="display: none;"></div>
            </div>
        </div>
        <script src="resources/js/jquery-1.10.2.min.js"></script>
        <script src="resources/js/jquery.browser.min.js"></script>
        <script src="resources/js/d3.v3.min.js"></script>
        <script src="resources/js/colorbrewer.js"></script>
        <script src="resources/js/geometry.js"></script>
        <script>
            var config = {  
            	    "title":"Database process documentation",
            	    "graph":{  
            	        "linkDistance":100,
            	        "charge":-400,
            	        "height":1800,
            	        "numColors":12,
            	        "labelPadding":{  
            	            "left":12,
            	            "right":5,
            	            "top":12,
            	            "bottom":5
            	        },
            	        "labelMargin":{  
            	            "left":12,
            	            "right":12,
            	            "top":12,
            	            "bottom":12
            	        },
            	        "ticksWithoutCollisions":50
            	    },
            	    "types":{  
            	        "activity":{  
            	            "short":"Activity",
            	            "long":"Activity"
            	        },
            	        "parallel":{  
            	            "short":"Parallel",
            	            "long":"Parallel Gateway"
            	        },
            	        "end":{  
            	            "short":"End",
            	            "long":"End Event"
            	        },
            	        "start":{  
            	            "short":"Start",
            	            "long":"Start Event"
            	        },
            	    },
            	    "constraints":[  
            	        {
            	            "has":{  
            	                "type":"table"
            	            },
            	            "type":"position",
            	            "y":0.1,
            	            "weight":0.8
            	        },
            	        {  
            	            "has":{  
            	                "type":"view"
            	            },
            	            "type":"position",
            	            "y":0.2,
            	            "weight":0.8
            	        },
            	        {  
            	            "has":{  
            	                "type":"query"
            	            },
            	            "type":"position",
            	            "y":0.5,
            	            "weight":0.5
            	        },
            	        {  
            	            "has":{  
            	                "type":"database"
            	            },
            	            "type":"position",
            	            "y":0.8,
            	            "weight":0.8
            	        },
            	        {  
            	            "has":{  
            	                "type":"report"
            	            },
            	            "type":"position",
            	            "y":1,
            	            "weight":0.8
            	        },
            	        {  
            	            "has":{  
            	                "type":"report",
            	                "group":"Intermediate"
            	            },
            	            "type":"position",
            	            "y":0.8,
            	            "weight":0.8
            	        },
            	        {  
            	            "has":{  
            	                "type":"report",
            	                "group":"Reporting"
            	            },
            	            "type":"position",
            	            "x":0.9,
            	            "weight":0.8
            	        },
            	        {  
            	            "has":{  
            	                "type":"query",
            	                "group":"Data1"
            	            },
            	            "type":"position",
            	            "x":0.15,
            	            "weight":0.7
            	        },
            	        {  
            	            "has":{  
            	                "type":"query",
            	                "group":"Data3"
            	            },
            	            "type":"position",
            	            "x":0.2,
            	            "weight":0.7
            	        },
            	        {  
            	            "has":{  
            	                "type":"query",
            	                "group":"Data4"
            	            },
            	            "type":"position",
            	            "x":0.2,
            	            "weight":0.7
            	        },
            	        {  
            	            "has":{  
            	                "type":"query",
            	                "group":"Data2"
            	            },
            	            "type":"position",
            	            "x":0.5,
            	            "weight":0.4
            	        },
            	        {  
            	            "has":{  
            	                "type":"query",
            	                "group":"Validation"
            	            },
            	            "type":"position",
            	            "x":0.8,
            	            "y":0.7,
            	            "weight":0.7
            	        },
            	        {  
            	            "has":{  
            	                "type":"query",
            	                "group":"Miscellaneous"
            	            },
            	            "type":"position",
            	            "x":0.9,
            	            "y":0.5,
            	            "weight":0.7
            	        },
            	        {  
            	            "has":{  
            	                "type":"query",
            	                "group":"Management"
            	            },
            	            "type":"position",
            	            "x":0.95,
            	            "weight":0.7
            	        },
            	        {  
            	            "has":{  
            	                "type":"query"
            	            },
            	            "type":"linkStrength",
            	            "strength":0.25
            	        },
            	        {  
            	            "has":{  
            	                "type":"database"
            	            },
            	            "type":"linkStrength",
            	            "strength":0.5
            	        }
            	    ],
            	    "jsonUrl":"main?action=jsonData"
            	};
        </script>
        <script src="resources/js/script.js"></script>
    

</body></html>